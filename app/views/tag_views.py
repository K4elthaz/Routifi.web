from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Tag, Organization
from ..serializers.tag_serializers import TagSerializer

class TagView(APIView):
    def post(self, request, slug):
        """Create a tag under an organization."""
        organization = get_object_or_404(Organization, slug=slug)  # Use the slug to get the organization
        data = request.data
        data["organization"] = organization.id
        serializer = TagSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, slug):
        """Retrieve tags under an organization."""
        organization = get_object_or_404(Organization, slug=slug)  # Use the slug to get the organization
        tags = Tag.objects.filter(organization=organization)
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
