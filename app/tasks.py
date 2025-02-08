from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from .models import Lead, LeadAssignment, Organization, UserProfile, LeadHistory
import redis
import logging
import uuid  # For generating tokens

# Initialize Redis client
redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

# Set up logging
logger = logging.getLogger(__name__)

@shared_task
def assign_leads_to_members():
    logger.info("Starting lead assignment task...")

    organizations = Organization.objects.all()

    for organization in organizations:
        current_day = timezone.now().weekday()

        users = UserProfile.objects.filter(
            memberships__organization=organization,
            memberships__accepted=True
        ).prefetch_related("tags").exclude(
            lead_assignments__status="pending"
        ).distinct()

        redis_queue_name = f"leads_queue:{organization.slug.replace(' ', '_').lower()}"
        
        # Fetch one lead at a time from the Redis queue
        lead_id = redis_client.lpop(redis_queue_name)  # lpop retrieves and removes the first element from the list
        
        if not lead_id:
            logger.info(f"No leads in queue for {organization.name}")
            continue  # Skip this organization if no leads
        
        # Convert lead ID to UUID
        lead = Lead.objects.get(id=uuid.UUID(lead_id.decode("utf-8")))

        # Ensure lead is not already assigned and is still unassigned
        existing_assignment = LeadAssignment.objects.filter(lead=lead, status="pending").first()
        if existing_assignment:
            logger.info(f"Lead {lead.id} is already assigned and pending decision.")
            continue  # Skip this lead if it's pending

        # Ensure the user has no pending lead assignments
        matching_users = [
            user for user in users
            if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
            and current_day in user.availability
            and not LeadAssignment.objects.filter(user=user, status="pending").exists()  # Check for pending assignments
        ]

        if not matching_users:
            logger.info(f"No available users for lead {lead.id} in {organization.name}")
            continue  # Skip this lead if no matching users

        user = matching_users[0]  # Assign the lead to the first matching user

        # Generate a unique token for the lead assignment
        token = str(uuid.uuid4())

        # Store the token in Redis with a 10-minute expiry
        redis_token_key = f"lead_token:{lead.id}"
        redis_client.setex(redis_token_key, 600, token)  # Expiry in 600 seconds (10 minutes)

        expires_at = timezone.now() + timedelta(minutes=10)
        lead_assignment = LeadAssignment.objects.create(
            lead=lead,
            user=user,
            expires_at=expires_at,
            lead_link=f"/accept-lead/{lead.id}/?token={token}",
            status="pending",  # Mark assignment as pending
        )

        LeadHistory.objects.create(
            lead=lead,
            user=user,
            action="assigned",
        )

        logger.info(f"Assigned lead {lead.id} to {user.pk} with token {token}")

    logger.info("Lead assignment task completed.")


@shared_task
def check_expired_lead_assignments():
    expired_assignments = LeadAssignment.objects.filter(status="pending", expires_at__lt=timezone.now())
    
    for assignment in expired_assignments:
        # Mark the assignment as expired
        assignment.status = "expired"
        assignment.save()

        # Update lead history when the assignment expires
        LeadHistory.objects.create(
            lead=assignment.lead,
            user=assignment.user,
            action="expired",
            user_choice="passed",  # Since the lead expired, the user passed
            user_response_time=10  # Since expiry is 10 minutes
        )

        # Log the expiration
        logger.info(f"Lead {assignment.lead.id} expired for user {assignment.user.id}")

        # Push the lead back into the organization's Redis queue
        redis_queue_name = f"leads_queue:{assignment.lead.organization.slug.replace(' ', '_').lower()}"

        # Re-add the lead ID to the Redis queue for this organization (only if it's not already in the queue)
        redis_client.rpush(redis_queue_name, str(assignment.lead.id))  # Use rpush to add to the end of the list
        
        # Optionally, delete the token in Redis to reset the state for re-assignment
        redis_token_key = f"lead_token:{assignment.lead.id}"
        redis_client.delete(redis_token_key)  # Clean up the old token in Redis


