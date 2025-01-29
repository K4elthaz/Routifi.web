from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Lead, Organization, UserProfile
from ..serializers.lead_serializers import LeadSerializer
from ..views.user_views import verify_supabase_token
import json

class LeadView(APIView):
    def post(self, request, slug):
        """Create a new lead for an organization with API Key authentication."""
        organization = get_object_or_404(Organization, slug=slug)
        
        # Require API Key for security
        provided_api_key = request.headers.get("X-API-KEY")
        if not provided_api_key or provided_api_key != organization.api_key:
            return Response({"error": "Invalid API Key"}, status=status.HTTP_403_FORBIDDEN)

        # Process the lead creation
        data = request.data
        data["organization"] = organization.id  # Associate lead with the organization
        serializer = LeadSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, slug):
        """Retrieve leads for an organization, user must be authenticated and authorized."""
        # Verify the Supabase token from Authorization header
        response = verify_supabase_token(request)

        if response.status_code != 200:
            return response  # If token is invalid, return error

        # Extract the user data from the JsonResponse content
        try:
            user_data = json.loads(response.content).get('user', {})
        except json.JSONDecodeError:
            return Response({"error": "Error decoding token response"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = user_data.get('id')

        # Get the organization by slug
        organization = get_object_or_404(Organization, slug=slug)

        # Optionally, check if the authenticated user is allowed to view this organization's leads
        # For example, check that the user is part of the organization or is the creator of the organization
        user_profile = UserProfile.objects.filter(supabase_uid=user_id).first()
        if user_profile and organization.created_by != user_profile:
            return Response({"error": "User does not have permission to view leads for this organization"}, 
                            status=status.HTTP_403_FORBIDDEN)

        # Retrieve leads associated with the organization
        leads = Lead.objects.filter(organization=organization)

        # Serialize and return the data
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)
