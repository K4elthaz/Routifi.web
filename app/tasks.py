import os
from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from .models import Lead, LeadAssignment, Organization, UserProfile, LeadHistory
import redis
import logging
import uuid  # For generating tokens

# Initialize Redis client
redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

# Set up logging
logger = logging.getLogger(__name__)

@shared_task
def assign_leads_to_members(batch_size=5):
    logger.info("Starting batch lead assignment task...")

    organizations = Organization.objects.all()

    for organization in organizations:
        current_day = timezone.now().weekday()

        # Skip organizations with pending lead assignments
        if LeadAssignment.objects.filter(user__memberships__organization=organization, status="pending").exists():
            logger.info(f"Skipping {organization.name}: pending leads exist.")
            continue

        users = UserProfile.objects.filter(
            memberships__organization=organization,
            memberships__accepted=True
        ).prefetch_related("tags").distinct()

        redis_queue_name = f"leads_queue:{organization.slug.replace(' ', '_').lower()}"

        # Fetch up to `batch_size` leads at once
        lead_ids = redis_client.lrange(redis_queue_name, 0, batch_size - 1)

        if not lead_ids:
            logger.info(f"No leads in queue for {organization.name}")
            continue

        leads = Lead.objects.filter(id__in=[uuid.UUID(l.decode("utf-8")) for l in lead_ids])

        assigned_leads = []

        for lead in leads:
            if LeadAssignment.objects.filter(lead=lead, status="pending").exists():
                logger.info(f"Lead {lead.id} already assigned.")
                continue

            matching_users = [
                user for user in users
                if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
                and current_day in user.availability
                and not LeadAssignment.objects.filter(user=user, status="pending").exists()
            ]

            if not matching_users:
                logger.info(f"No available users for lead {lead.id} in {organization.name}")
                continue

            user = matching_users[0]  # Assign to the first available user
            expires_at = timezone.now() + timedelta(minutes=10)

            # Generate a unique token for lead acceptance
            token = str(uuid.uuid4())

            with transaction.atomic():
                LeadAssignment.objects.create(
                    lead=lead,
                    user=user,
                    expires_at=expires_at,
                    lead_link = f"{os.environ.get('SERVER_END_POINT')}app/leads/assignment/{lead.id}/?token={token}",
                    status="pending",
                )

                LeadHistory.objects.create(
                    lead=lead,
                    user=user,
                    action="assigned",
                )

            assigned_leads.append(lead.id)

            # Store the token in Redis (No expiration, we track expiration in DB)
            redis_token_key = f"lead_token:{lead.id}"
            redis_client.set(redis_token_key, token)

            # Remove the lead from the Redis queue after assignment
            redis_client.lrem(redis_queue_name, 1, str(lead.id))

            logger.info(f"Assigned lead {lead.id} to {user.pk} with token {token}")

        logger.info(f"Assigned {len(assigned_leads)} leads for {organization.name}")

    logger.info("Batch lead assignment task completed.")


@shared_task
def check_expired_lead_assignments():
    logger.info("Checking for expired lead assignments...")

    expired_assignments = LeadAssignment.objects.filter(status="pending", expires_at__lt=timezone.now())

    if not expired_assignments.exists():
        logger.info("No expired leads found.")
        return

    requeued_leads = []

    for assignment in expired_assignments:
        with transaction.atomic():
            assignment.status = "expired"
            assignment.save()

            LeadHistory.objects.create(
                lead=assignment.lead,
                user=assignment.user,
                action="expired",
                user_choice="passed",
                user_response_time=10
            )

            redis_queue_name = f"leads_queue:{assignment.lead.organization.slug.replace(' ', '_').lower()}"

            # Requeue lead only if it’s not already in Redis
            if str(assignment.lead.id) not in redis_client.lrange(redis_queue_name, 0, -1):
                redis_client.lpush(redis_queue_name, str(assignment.lead.id))
                requeued_leads.append(assignment.lead.id)

            logger.info(f"Lead {assignment.lead.id} expired and was requeued.")

    logger.info(f"Requeued {len(requeued_leads)} expired leads.")

