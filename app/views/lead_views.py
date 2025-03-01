import json
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.http import JsonResponse
from django.utils import timezone
from ..models import Lead, Organization, LeadsInQueue, LeadAssignment, UserProfile, LeadHistory
from ..serializers.lead_serializers import LeadSerializer
import redis
from django.conf import settings
from datetime import datetime
from ..views.user_views import verify_supabase_token
from rest_framework.response import Response
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
        
    def get(self, request, slug, *args, **kwargs):
        # Step 1: Verify Supabase token
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return JsonResponse({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_data['user']
        user_profile = get_object_or_404(UserProfile, supabase_uid=user['id'])

        # Step 2: Retrieve the organization using the slug
        organization = get_object_or_404(Organization, slug=slug)
        
        # Step 3: Validate if the request user has access to the organization
        if organization.created_by != user_profile:
            return JsonResponse({"error": "You do not have permission to access these leads"}, status=status.HTTP_403_FORBIDDEN)

        # Step 4: Retrieve leads associated with the organization
        leads = Lead.objects.filter(organization=organization)
        serializer = LeadSerializer(leads, many=True)

        return JsonResponse({"leads": serializer.data}, status=status.HTTP_200_OK)
    
    def put(self, request, slug, lead_id, *args, **kwargs):
        """Update lead details if it has not been assigned."""
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return JsonResponse({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = get_object_or_404(UserProfile, supabase_uid=user_data['user']['id'])
        organization = get_object_or_404(Organization, slug=slug)

        if organization.created_by != user_profile:
            return JsonResponse({"error": "You do not have permission to update this lead"}, status=status.HTTP_403_FORBIDDEN)

        lead = get_object_or_404(Lead, id=lead_id, organization=organization)

        # Check if the lead is assigned
        if lead.assignments.exists():
            return JsonResponse({"error": "This lead has been assigned and cannot be updated"}, status=status.HTTP_403_FORBIDDEN)

        # Update lead details
        data = json.loads(request.body)
        serializer = LeadSerializer(lead, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"message": "Lead updated successfully", "lead": serializer.data}, status=status.HTTP_200_OK)

        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, lead_id, *args, **kwargs):
        """Delete lead only if it is not assigned."""
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return JsonResponse({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = get_object_or_404(UserProfile, supabase_uid=user_data['user']['id'])
        organization = get_object_or_404(Organization, slug=slug)

        if organization.created_by != user_profile:
            return JsonResponse({"error": "You do not have permission to delete this lead"}, status=status.HTTP_403_FORBIDDEN)

        lead = get_object_or_404(Lead, id=lead_id, organization=organization)

        # Check if the lead is assigned
        if lead.assignments.exists():
            return JsonResponse({"error": "This lead has been assigned and cannot be deleted"}, status=status.HTTP_403_FORBIDDEN)

        lead.delete()
        return JsonResponse({"message": "Lead deleted successfully"}, status=status.HTTP_200_OK)
    

class LeadAssignmentView(APIView):
    """ Handles lead acceptance and rejection """

    def post(self, request, lead_id):
    # Step 1: Verify the Supabase token
        response = verify_supabase_token(request)

        # Ensure response is valid
        if response.status_code != 200:
            return Response({"error": "Invalid Supabase token response"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_data = json.loads(response.content)  # Convert JSON response to dictionary
            user_data = user_data.get("user", {})  # Extract the 'user' key from the response
        except Exception:
            return Response({"error": "Failed to extract user data"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if 'id' exists in user_data
        user_id = user_data.get("id")
        if not user_id:
            return Response({"error": "User ID missing in token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = get_object_or_404(UserProfile, supabase_uid=user_id)

        # Step 2: Get token from query params
        token = request.GET.get('token')
        if not token:
            return Response({"error": "Missing token."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Retrieve and validate token from Redis
        redis_token_key = f"lead_token:{lead_id}"
        stored_token = redis_client.get(redis_token_key)

        if not stored_token:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        stored_token = stored_token.decode("utf-8")

        # Fetch the correct LeadAssignment using the Redis token
        lead_assignment = get_object_or_404(LeadAssignment, lead_id=lead_id, status="pending")

        # Ensure the token matches
        if stored_token != token:
            return Response({"error": "Token mismatch. The provided token does not match the stored token."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ensure the lead belongs to theuser making the request
        if lead_assignment.user != user_profile:
            return Response({"error": "You are not authorized to accept this lead."}, status=status.HTTP_403_FORBIDDEN)

        if lead_assignment.status != "pending":
            return Response({"error": "This lead has already been accepted or rejected."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 5: Handle expiration check
        if lead_assignment.expires_at < timezone.now():
            lead_assignment.status = "expired"
            lead_assignment.save()
            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=user_profile,
                action="expired",
                user_choice="none",
                user_response_time=10
            )
            return Response({"error": "This lead has expired and cannot be processed."}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')
        if action not in ['accept', 'reject']:
            return Response({"error": "Invalid action. Must be 'accept' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 6: Handle Acceptance
        if action == 'accept':
            lead_assignment.status = 'accepted'
            lead_assignment.accepted_at = timezone.now()
            lead_assignment.save()

            # Update LeadHistory
            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=user_profile,
                action="accepted",
                user_choice="accepted",
                user_response_time=(timezone.now() - lead_assignment.assigned_at).total_seconds() / 60
            )
            
            LeadsInQueue.objects.filter(lead=lead_assignment.lead).delete()

            # Assign the lead to the user's `LeadsOwned`
            user_profile.LeadsOwned.add(lead_assignment.lead)

            # Remove token from Redis
            redis_client.delete(redis_token_key)

            return Response({"message": "Lead accepted and added to your owned leads."}, status=status.HTTP_200_OK)

        # Step 7: Handle Rejection
        if action == 'reject':
            lead_assignment.status = 'rejected'
            lead_assignment.rejected_at = timezone.now()
            lead_assignment.save()

            LeadHistory.objects.create(
                lead=lead_assignment.lead,
                user=user_profile,
                action="rejected",
                user_choice="rejected",
                user_response_time=(timezone.now() - lead_assignment.assigned_at).total_seconds() / 60
            )

            # Remove token and re-add lead to Redis queue
            redis_client.delete(redis_token_key)

            redis_queue_name = f"leads_queue:{lead_assignment.lead.organization.slug.replace(' ', '_').lower()}"
            redis_client.rpush(redis_queue_name, str(lead_assignment.lead.id))

            return Response({"message": "Lead rejected and re-added to the queue."}, status=status.HTTP_200_OK)

class LeadHistoryView(APIView):
    """ Fetches lead history for a specific organization, accessible only to the creator/owner """

    def get(self, request, slug, *args, **kwargs):
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return JsonResponse({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_data['user']
        user_profile = get_object_or_404(UserProfile, supabase_uid=user['id'])

        organization = get_object_or_404(Organization, slug=slug)

        if organization.created_by != user_profile:
            return JsonResponse({"error": "You do not have permission to access this data"}, status=status.HTTP_403_FORBIDDEN)

        lead_histories = LeadHistory.objects.filter(lead__organization=organization)
        
        user_stats = {}
        for history in lead_histories:
            user_id = history.user.id
            if user_id not in user_stats:
                user_stats[user_id] = {
                    "user": history.user.full_name,
                    "total_accepted": 0,
                    "total_response_time": 0,
                    "response_count": 0
                }

            if history.action == "accepted":
                user_stats[user_id]["total_accepted"] += 1
            
            if history.user_response_time:
                user_stats[user_id]["total_response_time"] += history.user_response_time
                user_stats[user_id]["response_count"] += 1

        for user_id, stats in user_stats.items():
            if stats["response_count"] > 0:
                stats["average_response_time"] = stats["total_response_time"] / stats["response_count"]
            else:
                stats["average_response_time"] = 0

            # Apply max cap of 10 minutes per response
            stats["average_response_time"] = min(stats["average_response_time"], 10)

            # Remove unnecessary fields
            del stats["total_response_time"]
            del stats["response_count"]

        return JsonResponse({"organization": organization.name, "members": list(user_stats.values())}, status=status.HTTP_200_OK)
