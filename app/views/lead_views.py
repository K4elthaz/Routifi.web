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
from ..tasks import assign_lead_to_user, process_lead_decision
import logging
from uuid import UUID

redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)
logger = logging.getLogger(__name__)


class LeadView(APIView):
    from uuid import UUID
import logging

logger = logging.getLogger(__name__)

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

            # Ensure lead.id is a valid UUID before passing to Celery
            try:
                lead_id = str(lead.id)  # Ensure it's a string of UUID
                UUID(lead_id)  # This will raise an error if it's not a valid UUID
                logger.info(f"Created valid lead ID: {lead.id}")
            except ValueError:
                logger.error(f"Invalid lead ID format: {lead.id}")
                return Response({"error": "Invalid lead ID format"}, status=status.HTTP_400_BAD_REQUEST)

            # Delegate lead assignment to Celery task
            logger.info(f"Calling Celery task with lead.id: {lead.id} (UUID: {str(lead.id)})")
            assign_lead_to_user.apply_async(args=[lead_id, str(organization.id)])

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

        # Delegate decision processing to Celery
        process_lead_decision.apply_async(args=[lead.id, user_id, decision, response_time_minutes, token])

        return Response({"message": f"Lead {decision} and reassigned"}, status=status.HTTP_200_OK)

class UserLeadsView(APIView):
    def get(self, request, supabase_uid):
        user = get_object_or_404(UserProfile, supabase_uid=supabase_uid)
        
        # Retrieve leads assigned to the user with their status (pending, accepted, rejected)
        lead_assignments = LeadAssignment.objects.filter(user=user)
        
        leads_data = []
        for assignment in lead_assignments:
            lead = assignment.lead
            leads_data.append({
                "lead_id": str(lead.id),
                "status": assignment.status,
                "assigned_at": assignment.assigned_at,
                "expires_at": assignment.expires_at
            })

        return Response({"leads": leads_data}, status=status.HTTP_200_OK)

class OrganizationLeadsView(APIView):
    def get(self, request, org_id):
        organization = get_object_or_404(Organization, id=org_id)
        
        # Retrieve all leads associated with the organization
        leads = Lead.objects.filter(organization=organization)

        leads_data = []
        for lead in leads:
            lead_assignments = LeadAssignment.objects.filter(lead=lead)
            assignment_data = []
            for assignment in lead_assignments:
                assignment_data.append({
                    "user": assignment.user.supabase_uid,
                    "status": assignment.status,
                    "assigned_at": assignment.assigned_at,
                    "expires_at": assignment.expires_at
                })
            
            leads_data.append({
                "lead_id": str(lead.id),
                "status": lead.status,
                "assigned_to": assignment_data
            })

        return Response({"leads": leads_data}, status=status.HTTP_200_OK)