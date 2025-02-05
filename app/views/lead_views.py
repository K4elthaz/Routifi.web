from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Lead, Organization, UserProfile, Membership, Settings, LeadAssignment
from ..serializers.lead_serializers import LeadSerializer
from ..views.user_views import verify_supabase_token
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
import json
import redis
import uuid

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
            self._send_lead_to_users(lead, organization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_lead_to_users(self, lead, organization):
        """Assign lead to users and store generated links."""

        current_day = timezone.now().weekday()

        users = UserProfile.objects.filter(
            memberships__organization=organization, memberships__accepted=True
        )

        matching_users = [
            user for user in users
            if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
            and current_day in user.availability
        ]

        print(f"Users to assign lead: {[user.email for user in matching_users]}")

        settings = Settings.objects.filter(organization=organization).first()
        if settings and settings.one_to_one and matching_users:
            rejected_users = redis_client.lrange(f"lead:{lead.id}:rejected_users", 0, -1)
            rejected_users = [uid.decode() for uid in rejected_users]

            next_user = next((u for u in matching_users if str(u.supabase_uid) not in rejected_users), None)

            if next_user:
                matching_users = [next_user]  
            else:
                return  

        for user in matching_users:
            lead_id = str(lead.id)
            user_id = str(user.supabase_uid)
            token = str(uuid.uuid4())

            redis_client.setex(f"lead:{lead_id}:user:{user_id}:token", timedelta(minutes=10), token)
            print(f"Generated token for lead {lead.id}, user {user.email}: {token}")

            lead_link = f"http://localhost:8000/lead/{lead_id}/accept/{token}/"

            try:
                LeadAssignment.objects.create(
                    lead=lead,
                    user=user,
                    assigned_at=timezone.now(),
                    status="pending",
                    lead_link=lead_link
                )
            except Exception as e:
                print(f"Error creating LeadAssignment: {e}")

            print(f"Lead assigned to {user.email}: {lead_link}") 


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

        if decision == "accept":
            lead.status = "accepted"
            lead.save()

            assignment.status = "accepted"
            assignment.save()

            return Response({"message": "Lead accepted"}, status=status.HTTP_200_OK)

        elif decision == "reject":
            assignment.status = "rejected"
            assignment.save()

            redis_client.rpush(f"lead:{lead_id}:rejected_users", str(user_id)) 

            self.reassign_lead(lead)

            return Response({"message": "Lead rejected and reassigned"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid decision"}, status=status.HTTP_400_BAD_REQUEST)

    def reassign_lead(self, lead):
        """Find the next user and reassign the lead."""
        organization = lead.organization
        users = UserProfile.objects.filter(
            memberships__organization=organization, memberships__accepted=True
        )

        matching_users = [
            user for user in users
            if set(user.tags.values_list("name", flat=True)).intersection(set(lead.tags or []))
        ]

        rejected_users = redis_client.lrange(f"lead:{lead.id}:rejected_users", 0, -1)
        rejected_users = [uid.decode() for uid in rejected_users]

        next_user = next((u for u in matching_users if str(u.supabase_uid) not in rejected_users), None)

        if next_user:
            lead.status = "pending"
            lead.save()

            lead_id = str(lead.id)
            user_id = str(next_user.supabase_uid)
            token = str(uuid.uuid4())

            redis_client.setex(f"lead:{lead_id}:user:{user_id}:token", timedelta(minutes=10), token)

            lead_link = f"http://localhost:8000/lead/{lead_id}/accept/{token}/"

            LeadAssignment.objects.create(
                lead=lead,
                user=next_user,
                assigned_at=timezone.now(),
                status="pending",
                lead_link=lead_link
            )

            print(f"Lead reassigned to {next_user.email}: {lead_link}")