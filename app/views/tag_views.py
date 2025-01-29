from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Tag, Organization
from ..serializers.tag_serializers import TagSerializer

class TagView(APIView):
    def post(self, request, org_id):
        """Create a tag under an organization."""
        organization = get_object_or_404(Organization, id=org_id)
        data = request.data
        data["organization"] = organization.id
        serializer = TagSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, org_id):
        """Retrieve tags under an organization."""
        tags = Tag.objects.filter(organization_id=org_id)
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
