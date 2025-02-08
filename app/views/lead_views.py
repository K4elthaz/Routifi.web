from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.http import JsonResponse
from django.utils import timezone
from ..models import Lead, Organization, LeadsInQueue, LeadAssignment
from ..serializers.lead_serializers import LeadSerializer
import redis
from django.conf import settings
from datetime import datetime

# Initialize Redis client
redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

class LeadCreateView(APIView):
    def post(self, request, *args, **kwargs):
        # Step 1: Retrieve the API key from the headers
        api_key = request.headers.get('X-API-KEY')
        if not api_key:
            return JsonResponse({"error": "API key is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Validate the organization using the API key
        try:
            organization = get_object_or_404(Organization, api_key=api_key)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        # Step 3: Retrieve the lead data from the request body
        lead_data = request.data
        if not isinstance(lead_data, list):  # Ensure it's an array of leads
            return JsonResponse({"error": "Expected an array of lead data"}, status=status.HTTP_400_BAD_REQUEST)
        
        leads = []  # List of successfully created lead objects
        redis_leads = []  # List of lead ids to push to Redis queue
        failed_leads = []  # List to store leads that failed during validation
        
        # Sanitizing the organization slug to make it Redis-compatible
        def sanitize_slug(slug):
            if not slug:
                return "unknown_org"
            return slug.replace(' ', '_').lower()

        # Redis queue name specific to the organization's slug
        redis_queue_name = f"leads_queue:{sanitize_slug(organization.slug)}"

        for lead in lead_data:
            # Ensure the organization field is added to the lead data before validation
            lead['organization'] = organization.id  # Ensure this is done correctly, possibly inside the serializer

            # Using the lead serializer to validate and save the lead
            serializer = LeadSerializer(data=lead, context={'organization': organization})

            if serializer.is_valid():
                new_lead = serializer.save()  # Save lead with tags handled by the serializer
                leads.append(new_lead)

                # Add the successfully created lead to LeadsInQueue
                lead_in_queue = LeadsInQueue(lead=new_lead)
                lead_in_queue.save()

                # Add the lead's ID to the list to push to the Redis queue
                redis_leads.append(str(new_lead.id))
            else:
                failed_leads.append(serializer.errors)

        # Push leads to Redis queue if there are any
        try:
            if redis_leads:
                redis_client.rpush(redis_queue_name, *redis_leads)
        except redis.exceptions.ConnectionError as e:
            return JsonResponse({"error": f"Failed to push leads to Redis queue: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Return the response with successful and failed lead details
        if failed_leads:
            return JsonResponse(
                {
                    "message": f"{len(leads)} leads have been successfully created for organization {organization.name}.",
                    "failed_leads": failed_leads,
                    "leads": [lead.id for lead in leads],
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return JsonResponse(
            {
                "message": f"{len(leads)} leads have been successfully created for organization {organization.name}.",
                "leads": [lead.id for lead in leads],
            },
            status=status.HTTP_201_CREATED,
        )


class LeadAssignmentView(APIView):
    def accept_or_reject_lead(self, request, lead_id):
        token = request.GET.get('token')
        if not token:
            return JsonResponse({"error": "Missing token."}, status=400)

        try:
            lead_assignment = get_object_or_404(LeadAssignment, lead_id=lead_id, token=token)
        except LeadAssignment.DoesNotExist:
            return JsonResponse({"error": "Lead assignment not found or invalid token."}, status=404)

        # Ensure the assignment is still pending
        if lead_assignment.status != "pending":
            return JsonResponse({"error": "This lead has already been accepted or rejected."}, status=400)

        # Check if the lead assignment is expired
        if lead_assignment.expires_at < timezone.now():
            # If expired, do not allow rejection, return a response
            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=lead_assignment.user,
                action="expired",
                user_choice="none",
                user_response_time=10  # Expiry time of 10 minutes
            )
            lead_assignment.status = "expired"
            lead_assignment.save()

            return JsonResponse({"error": "This lead has expired and cannot be rejected."}, status=400)

        action = request.data.get('action')
        if action not in ['accept', 'reject']:
            return JsonResponse({"error": "Invalid action. Must be 'accept' or 'reject'."}, status=400)

        # Handle acceptance
        if action == 'accept':
            lead_assignment.status = 'accepted'
            lead_assignment.accepted_at = timezone.now()
            lead_assignment.save()

            # Update LeadHistory
            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=lead_assignment.user,
                action="accepted",
                user_choice="accepted",
                user_response_time=(timezone.now() - lead_assignment.assigned_at).total_seconds() // 60  # Response time in minutes
            )

            # After accepting the lead, delete the token from Redis
            redis_client.delete(f"lead_token:{lead_id}")

            return JsonResponse({"message": "Lead accepted."}, status=200)

        # Handle rejection
        elif action == 'reject':
            lead_assignment.status = 'rejected'
            lead_assignment.rejected_at = timezone.now()
            lead_assignment.save()

            # Update LeadHistory
            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=lead_assignment.user,
                action="rejected",
                user_choice="rejected",
                user_response_time=(timezone.now() - lead_assignment.assigned_at).total_seconds() // 60  # Response time in minutes
            )

            # After rejecting, delete the token and re-add the lead to the Redis queue
            redis_client.delete(f"lead_token:{lead_id}")

            redis_queue_name = f"leads_queue:{lead_assignment.lead.organization.slug.replace(' ', '_').lower()}"
            redis_client.rpush(redis_queue_name, str(lead_assignment.lead.id))

            return JsonResponse({"message": "Lead rejected and re-added to the queue."}, status=200)

        return JsonResponse({"error": "Invalid action."}, status=400)


