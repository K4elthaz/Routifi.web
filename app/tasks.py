from celery import shared_task
from .models import Lead, LeadAssignment, LeadHistory, UserProfile, Organization, Settings, Membership
import uuid
from django.utils import timezone
import redis
from django.conf import settings
import logging
from datetime import timedelta
from uuid import UUID

# Initialize Redis client
redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

# Set up logging
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def assign_next_lead_from_queue(self, lead_id):
    try:
        # Validate lead_id as UUID
        try:
            lead_uuid = UUID(lead_id)  # This will raise an error if it's not a valid UUID
        except ValueError:
            logger.error(f"Invalid lead_id provided: {lead_id}. The ID should be in UUID format.")
            return

        # Pop the next user from the queue and assign the lead
        user_id = redis_client.lpop(f"lead:{lead_id}:queue")
        if user_id:
            user = UserProfile.objects.get(supabase_uid=user_id.decode())
            
            # Get the organization of the user via the Membership model
            membership = user.memberships.filter(accepted=True).first()
            if not membership:
                logger.error(f"User {user_id} is not a member of any accepted organization.")
                return
            
            organization = membership.organization
            assign_lead_to_user.apply_async(args=[str(lead_id), str(organization.id)])
    except Exception as e:
        logger.error(f"Error in assign_next_lead_from_queue: {e}")
        raise self.retry(exc=e)  # Retry the task

@shared_task
def assign_lead_to_user(lead_id, organization_id):
    try:
        # Ensure lead_id is a valid UUID
        lead_uuid = UUID(lead_id)  # This will raise an error if it's not a valid UUID
        lead = Lead.objects.get(id=lead_uuid)
    except ValueError:
        logger.error(f"Invalid lead_id provided: {lead_id}. The ID should be in UUID format.")
        return
    except Lead.DoesNotExist:
        logger.error(f"Lead with ID {lead_uuid} does not exist.")
        return

    try:
        organization = Organization.objects.get(id=organization_id)
    except Organization.DoesNotExist:
        logger.error(f"Organization with ID {organization_id} does not exist.")
        return

    # Continue with the logic
    current_day = timezone.now().weekday()

    users = UserProfile.objects.filter(
        memberships__organization=organization, memberships__accepted=True
    )

    # Only select users who are available AND don't have a pending lead
    matching_users = [
        user for user in users
        if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
        and current_day in user.availability
        and not LeadAssignment.objects.filter(user=user, status="pending").exists()
    ]

    # If you have settings to enforce one-to-one lead assignment
    settings = Settings.objects.filter(organization=organization).first()
    if settings and settings.one_to_one and matching_users:
        rejected_users = redis_client.lrange(f"lead:{lead.id}:rejected_users", 0, -1)
        rejected_users = [uid.decode() for uid in rejected_users]

        next_user = next((u for u in matching_users if str(u.supabase_uid) not in rejected_users), None)

        if next_user:
            matching_users = [next_user]
        else:
            logger.info(f"No valid user to assign for lead {lead.id}, skipping assignment.")
            return

    if matching_users:
        redis_client.rpush(f"lead:{lead.id}:queue", *[str(user.supabase_uid) for user in matching_users])
        redis_client.expire(f"lead:{lead.id}:queue", 3600)  # Set expiration to 1 hour
        redis_client.expire(f"lead:{lead.id}:rejected_users", 3600)  # Set expiration to 1 hour
        
        # Add expiration time (10 minutes from now)
        expires_at = timezone.now() + timedelta(minutes=10)

        # Create the LeadAssignment objects with expiration
        for user in matching_users:
            token = str(uuid.uuid4())  # Generate a unique token
            link = f"http://localhost:8000/app/leads/{lead.id}/decision/{token}/"
            assignment = LeadAssignment.objects.create(
                lead=lead, 
                user=user, 
                status="pending", 
                expires_at=expires_at,
                lead_link=link  # Correctly assign the link here
            )

            # Store the token in Redis
            redis_client.set(f"lead:{lead.id}:user:{user.supabase_uid}:token", token, ex=expires_at)
            # Assuming lead_link should be linked with the LeadHistory, create the LeadHistory
            LeadHistory.objects.create(lead=lead, user=user, action="assigned")

        # Log with the correct field, e.g., `supabase_uid`
        logger.info(f"Lead {lead.id} assigned to users: {', '.join(str(user.supabase_uid) for user in matching_users)}")
    else:
        logger.info(f"No users found for lead {lead.id}, skipping Redis qaw.")

    # Assign the first user in the queue
    assign_next_lead_from_queue.apply_async(args=[lead.id])  # Async call

@shared_task
def process_lead_decision(lead_id, user_id, decision, response_time_minutes, token):
    try:
        lead = Lead.objects.get(id=lead_id)
        user = UserProfile.objects.get(supabase_uid=user_id)

        assignment = LeadAssignment.objects.filter(lead=lead, user=user, status="pending").first()
        if not assignment:
            logger.error(f"No pending lead assignment found for lead {lead_id} and user {user_id}.")
            return

        # Validate the token against Redis
        expected_token = redis_client.get(f"lead:{lead_id}:user:{user_id}:token")
        if not expected_token or expected_token.decode() != token:
            logger.error(f"Invalid token or token expired for lead {lead_id} and user {user_id}.")
            return

        if decision == "accept":
            lead.status = "accepted"
            lead.save()
            assignment.status = "accepted"
            assignment.save()

            LeadHistory.objects.create(lead=lead, user=user, action="accepted", user_response_time=response_time_minutes)
            assign_next_lead_from_queue.apply_async(args=[lead.id])

        elif decision == "reject":
            assignment.status = "rejected"
            assignment.save()

            LeadHistory.objects.create(lead=lead, user=user, action="rejected", user_response_time=response_time_minutes)

            redis_client.rpush(f"lead:{lead_id}:rejected_users", str(user_id))
            assign_next_lead_from_queue.apply_async(args=[lead.id])

    except Exception as e:
        logger.error(f"Error processing lead decision for lead {lead_id}, user {user_id}: {e}")
        raise

@shared_task
def expire_unaccepted_leads():
    try:
        unaccepted_leads = Lead.objects.filter(status="pending", created_at__lte=timezone.now() - timezone.timedelta(hours=1))  # Assuming leads older than 1 hour are expired
        
        for lead in unaccepted_leads:
            lead.status = "expired"
            lead.save()

            logger.info(f"Lead {lead.id} expired due to inactivity.")
    except Exception as e:
        logger.error(f"Error in expire_unaccepted_leads task: {e}")
        raise
