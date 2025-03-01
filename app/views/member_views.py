from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Organization, Membership, Tag, MembershipTag
from ..views.user_views import verify_supabase_token

class MemberView(APIView):
    def put(self, request, organization_id, user_id):
        # Step 1: Verify authentication
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        # Step 3: Get organization
        organization = get_object_or_404(Organization, id=organization_id)

        # Step 4: Get membership - Return detailed error if not found
        membership = Membership.objects.filter(user__supabase_uid=user_id, organization=organization).first()
        if not membership:
            return Response({"error": "Membership not found for this organization"}, status=status.HTTP_404_NOT_FOUND)

       # Step 5: Validate request data
        tag_ids = request.data.get("tag_ids")  # Expecting a single tag ID or a list of tag IDs

        # Normalize input to a list
        if isinstance(tag_ids, str):
           tag_ids = [tag_ids]  # Convert single string to a list
        elif not isinstance(tag_ids, list):
            return Response({"error": "A list of tag IDs or a single tag ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 6: Assign tags
        assigned_tags = []
        for tag_id in tag_ids:
            # Ensure the tag belongs to the organization
            tag = get_object_or_404(Tag, id=tag_id, organization=organization)
            MembershipTag.objects.get_or_create(membership=membership, tag=tag)
            assigned_tags.append(tag_id)

        return Response({"message": f"Tags {assigned_tags} added to the member"}, status=status.HTTP_200_OK)
    
    def get(self, request, organization_id, user_id):
        # Step 1: Verify authentication
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response
        
        organization = get_object_or_404(Organization, id=organization_id)

        membership = get_object_or_404(Membership, user__supabase_uid=user_id, organization=organization)

        # Fetching tags from MembershipTag
        tags = MembershipTag.objects.filter(membership=membership).values_list("tag__id", "tag__name")

        membership_data = {
            "user_id": user_id,
            "organization_id": organization_id,
            "tags": list(tags)
        }

        return Response(membership_data, status=status.HTTP_200_OK)


