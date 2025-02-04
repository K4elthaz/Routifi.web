from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Lead, Organization, UserProfile
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
    def post(self, request, slug):
        organization = get_object_or_404(Organization, slug=slug)
        
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
        """Match tags and send lead to users."""
        users = UserProfile.objects.filter(organization=organization)
        matching_users = []

        for user in users:
            user_tags = set(user.tags.values_list("name", flat=True))
            lead_tags = set(lead.tags or [])
            if user_tags.intersection(lead_tags):
                if current_day in user.availability:
                    matching_users.append(user)

        for user in matching_users:
            lead_id = str(lead.id)
            user_id = str(user.id)
            token = str(uuid.uuid4())

            redis_client.setex(f"lead:{lead_id}:user:{user_id}:token", timedelta(minutes=10), token)

            lead_link = f"http://localhost:8000/lead/{lead_id}/accept/{token}/"
            send_mail(
                "New Lead: Action Required",
                f"You have a new lead! To accept or reject, visit: {lead_link}",
                "no-reply@yourapp.com",
                [user.email],
            )

    def get(self, request, slug):
        """Retrieve leads for an organization, user must be authenticated and authorized."""
        response = verify_supabase_token(request)

        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content).get('user', {})
        except json.JSONDecodeError:
            return Response({"error": "Error decoding token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = user_data.get('id')

        organization = get_object_or_404(Organization, slug=slug)

        user_profile = UserProfile.objects.filter(supabase_uid=user_id).first()
        if user_profile and organization.created_by != user_profile:
            return Response({"error": "User does not have permission to view leads for this organization"}, 
                            status=status.HTTP_403_FORBIDDEN)

        leads = Lead.objects.filter(organization=organization)

        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)

class LeadDecisionView(APIView):
    def post(self, request, lead_id, token):
        lead_key = f"lead:{lead_id}:user:*:token"
        user_token = redis_client.get(lead_key)
        if user_token != token:
            return JsonResponse({"error": "Invalid token or lead expired"}, status=400)

        decision = request.data.get("decision")
        lead = get_object_or_404(Lead, id=lead_id)
        user_profile = get_object_or_404(UserProfile, id=request.user.id)

        if decision == "accept":
            lead.status = "accepted"
            lead.save()
            return JsonResponse({"message": "Lead accepted"}, status=200)

        elif decision == "reject":
            lead.status = "rejected"
            lead.save()
            return JsonResponse({"message": "Lead rejected"}, status=200)

        return JsonResponse({"error": "Invalid decision"}, status=400)