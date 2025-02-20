import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.urls import reverse
from ..models import Organization, Membership, UserProfile
from ..serializers.organization_serializers import OrganizationSerializer, MembershipSerializer
from ..views.user_views import verify_supabase_token
from django.http import JsonResponse

class OrganizationView(APIView):
    def get(self, request):
        """Retrieve organizations where the authenticated user is either the creator or an accepted member."""
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return Response({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return Response({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_data['user']
        user_profile = get_object_or_404(UserProfile, supabase_uid=user['id'])

        # Get organizations where the user is the creator
        created_orgs = Organization.objects.filter(created_by=user_profile)

        # Get organizations where user is a member and has accepted the invite
        member_orgs = Organization.objects.filter(members__user=user_profile, members__accepted=True)

        # Combine both querysets, avoiding duplicates
        organizations = (created_orgs | member_orgs).distinct()
        
        serializer = OrganizationSerializer(organizations, many=True, context={"user_profile": user_profile})

        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        """Create an organization."""
        # Step 1: Verify the Supabase token
        response = verify_supabase_token(request)  # This will verify the token and return user data
        if response.status_code != 200:
            return response  # If the token is invalid, return the error response

        # Step 2: Extract user from the JSON response
        try:
            user_data = json.loads(response.content)  # Manually parse the JSON content
        except json.JSONDecodeError:
            return Response({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return Response({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_data['user']
        user_profile = get_object_or_404(UserProfile, supabase_uid=user['id'])

        # Step 3: Serialize the organization data and save it with the authenticated user's profile
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=user_profile)  # The 'created_by' field is set to the UserProfile
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InviteUserToOrganization(APIView):
    """Invite a user to an organization via email."""
    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        email = request.data.get("email")
        user = get_object_or_404(UserProfile, email=email)

        invite, created = Membership.objects.get_or_create(
            user=user, organization=org, defaults={"role": "member", "invite_status": "pending"}
        )

        if not created and invite.accepted:
            return Response({"error": "User is already a member"}, status=status.HTTP_400_BAD_REQUEST)

        invite_link = f"http://127.0.0.1:5173/app/invite/accept/{invite.id}"
        send_mail(
            "Organization Invitation",
            f"You've been invited to join {org.name}. Accept your invite here: {invite_link}",
            "kael@fluxfusiondevsph.io", 
            [email],
        )

        return Response({"message": "Invitation sent"}, status=status.HTTP_200_OK)

class AcceptInviteView(APIView):
    """Accept an invitation to join an organization."""

    def post(self, request, invite_id):
        invite = get_object_or_404(Membership, id=invite_id, accepted=False)
        invite.accepted = True
        invite.save()

        organization = invite.organization

        return Response({"message": "Invite accepted", "slug": organization.slug}, status=status.HTTP_200_OK)

class OrganizationBySlugView(APIView):
    def get(self, request, slug):
        """Retrieve a specific organization by slug if the user is a member."""
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response

        try:
            user_data = json.loads(response.content)
        except json.JSONDecodeError:
            return Response({"error": "Failed to decode JSON from token response"}, status=status.HTTP_400_BAD_REQUEST)

        if 'user' not in user_data:
            return Response({"error": "User information not found in token response"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_data['user']
        user_profile = get_object_or_404(UserProfile, supabase_uid=user['id'])

        # Fetch the organization by slug and check if the user is a member
        org = get_object_or_404(Organization, slug=slug)
        is_member = Membership.objects.filter(user=user_profile, organization=org, accepted=True).exists()
        
        if not is_member and org.created_by != user_profile:
            return Response({"error": "You do not have access to this organization"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrganizationSerializer(org, context={"user_profile": user_profile})
        return Response(serializer.data, status=status.HTTP_200_OK)
