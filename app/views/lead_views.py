from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Lead, Organization, UserProfile, Membership, Settings, LeadAssignment, LeadHistory
from ..serializers.lead_serializers import LeadSerializer
from ..views.user_views import verify_supabase_token
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
import json
import redis
import uuid
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

class LeadView(APIView):
    def post(self, request):
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response  

        try:
            user_data = json.loads(response.content).get('user', {})
        except json.JSONDecodeError:
            return Response({"error": "Error decoding token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = user_data.get('id')
        user_profile = get_object_or_404(UserProfile, supabase_uid=user_id)

        organization = get_object_or_404(Organization, created_by=user_profile)

        provided_api_key = request.headers.get("X-API-KEY")
        if not provided_api_key or provided_api_key != organization.api_key:
            return Response({"error": "Invalid API Key"}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        data["organization"] = organization.id  
        serializer = LeadSerializer(data=data)
        if serializer.is_valid():
            lead = serializer.save()
            # Add the user field here to create LeadHistory entry with user
            LeadHistory.objects.create(lead=lead, action="created", user=user_profile)  # Add user here
            self._send_lead_to_users(lead, organization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_lead_to_users(self, lead, organization):
        current_day = timezone.now().weekday()

        users = UserProfile.objects.filter(
            memberships__organization=organization, memberships__accepted=True
        )

        matching_users = [
            user for user in users
            if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
            and current_day in user.availability
        ]

        settings = Settings.objects.filter(organization=organization).first()
        if settings and settings.one_to_one and matching_users:
            rejected_users = redis_client.lrange(f"lead:{lead.id}:rejected_users", 0, -1)
            rejected_users = [uid.decode() for uid in rejected_users]

            next_user = next((u for u in matching_users if str(u.supabase_uid) not in rejected_users), None)

            if next_user:
                matching_users = [next_user]  
            else:
                return  

        # Queue the lead assignment
        redis_client.rpush(f"lead:{lead.id}:queue", *[str(user.supabase_uid) for user in matching_users])
        # Send the first lead in the queue to a user
        self.assign_next_lead_from_queue(lead)

    def assign_next_lead_from_queue(self, lead):
        # Pop the next user from the queue and assign the lead
        user_id = redis_client.lpop(f"lead:{lead.id}:queue")
        if user_id:
            user = UserProfile.objects.get(supabase_uid=user_id.decode())
            self.assign_lead_to_user(lead, user)

    def assign_lead_to_user(self, lead, user):
        lead_id = str(lead.id)
        user_id = str(user.supabase_uid)
        token = str(uuid.uuid4())

        redis_client.setex(f"lead:{lead_id}:user:{user_id}:token", timedelta(minutes=10), token)

        lead_link = f"http://localhost:8000/lead/{lead_id}/accept/{token}/"

        expires_at = timezone.now() + timedelta(minutes=10)

        LeadAssignment.objects.create(
            lead=lead,
            user=user,
            assigned_at=timezone.now(),
            status="pending",
            lead_link=lead_link,
            expires_at=expires_at  # Add this line
        )

        # No need to add timestamp here as created_at will capture it automatically
        LeadHistory.objects.create(lead=lead, user=user, action="assigned")  # Remove timestamp

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"org_{lead.organization.id}",
            {
                "type": "send.lead",
                "lead_id": lead_id,
                "user_id": user_id,
                "lead_link": lead_link,
                "token": token
            }
        )

class LeadDecisionView(APIView):
    def post(self, request, lead_id, token):
        lead = get_object_or_404(Lead, id=lead_id)
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response
        
        try:
            user_data = json.loads(response.content).get('user', {})
        except json.JSONDecodeError:
            return Response({"error": "Error decoding token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = str(user_data.get('id'))

        assignment = LeadAssignment.objects.filter(lead=lead, user__supabase_uid=user_id, status="pending").first()
        if not assignment:
            return Response({"error": "No pending lead assignment found"}, status=status.HTTP_400_BAD_REQUEST)

        expected_token = redis_client.get(f"lead:{lead_id}:user:{user_id}:token")  
        if not expected_token or expected_token.decode() != token:
            return Response({"error": "Invalid token or lead expired"}, status=status.HTTP_400_BAD_REQUEST)

        decision = request.data.get("decision")

        # Calculate response time in minutes
        time_taken = timezone.now() - assignment.assigned_at
        response_time_minutes = time_taken.total_seconds() // 60  # Convert to minutes
        response_time_minutes = min(response_time_minutes, 10)  # Cap at 10 minutes

        if decision == "accept":
            lead.status = "accepted"
            lead.save()
            assignment.status = "accepted"
            assignment.save()

            # Create LeadHistory entry for 'accept'
            LeadHistory.objects.create(
                lead=lead,
                user=assignment.user,
                action="accepted",
                user_response_time=response_time_minutes
            )
            self.assign_next_lead_from_queue(lead)
            return Response({"message": "Lead accepted"}, status=status.HTTP_200_OK)

        elif decision == "reject":
            assignment.status = "rejected"
            assignment.save()

            # Create LeadHistory entry for 'reject'
            LeadHistory.objects.create(
                lead=lead,
                user=assignment.user,
                action="rejected",
                user_response_time=response_time_minutes
            )

            redis_client.rpush(f"lead:{lead_id}:rejected_users", str(user_id)) 
            self.assign_next_lead_from_queue(lead)
            return Response({"message": "Lead rejected and reassigned"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid decision"}, status=status.HTTP_400_BAD_REQUEST)
