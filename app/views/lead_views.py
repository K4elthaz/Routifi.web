from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Lead, Organization
from ..serializers.lead_serializers import LeadSerializer

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
