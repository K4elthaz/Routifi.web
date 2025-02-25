import json
import random
import string
from datetime import timedelta
from django.utils import timezone
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
    
def generate_invite_code(length=8):
    """Generate a random alphanumeric invite code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class InviteUserToOrganization(APIView):
    """Invite a user to an organization via a unique invite code."""

    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        email = request.data.get("email")

        user = UserProfile.objects.filter(email=email).first()
        is_user = bool(user)

        invite_code = generate_invite_code()

        # Ensure the invite exists and update or create the invite code
        invite, created = Membership.objects.update_or_create(
            email=email if not user else None,
            user=user if user else None,
            organization=org,
            defaults={
                "role": "member",
                "invite_status": "pending",
                "is_user": is_user,
                "invite_code": invite_code,
            }
        )

        if not created and not invite.invite_code:
            invite.invite_code = invite_code
            invite.save()

        # Customize the email message based on whether the user exists
        if is_user:
            email_message = (
                f"You've been invited to join {org.name}.\n\n"
                f"Please **log in** to accept the invitation using this invite code: **{invite.invite_code}**.\n"
                f"🔗 [Log in here](http://127.0.0.1:5173/sign-in)"
            )
        else:
            email_message = (
                f"You've been invited to join {org.name}.\n\n"
                f"Since you don't have an account, please **register first** and then use this invite code: **{invite.invite_code}**.\n"
                f"🔗 [Register here](http://127.0.0.1:5173/sign-up)"
            )

        send_mail(
            "Organization Invitation",
            email_message,
            "kael@fluxfusiondevsph.io",
            [email],
        )


        return Response({
            "message": "Invitation sent",
            "is_user": is_user,
            "already_invited": not created,
            "organization": org.name,
        }, status=status.HTTP_200_OK)

class AcceptInviteView(APIView):
    """Accept an organization invitation using an invite code with Supabase authentication."""

    def post(self, request):
        # Verify Supabase token
        response = verify_supabase_token(request)
        if response.status_code != 200:
            return response  # Return authentication failure response

        invite_code = request.data.get("invite_code")

        try:
            invite = Membership.objects.get(invite_code=invite_code)
        except Membership.DoesNotExist:
            return Response({"message": "Invalid invite code."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the invitation has expired (7 days)
        if invite.created_at + timedelta(days=7) < timezone.now():
            return Response({"message": "This invite has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the authenticated user from Supabase token
        response_data = json.loads(response.content)  # Convert JSONResponse to dict
        user_data = response_data.get("user")  
        if not user_data:
            return Response({"message": "User not found in authentication system."}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = user_data.get("email")
        supabase_uid = user_data.get("id")  # Supabase UID

        # Ensure the user accepting the invite matches the invite email
        if invite.email and invite.email != user_email:
            return Response({"message": "This invite is not for your account."}, status=status.HTTP_403_FORBIDDEN)

        # Fetch or create the UserProfile using `supabase_uid`
        user_profile, _ = UserProfile.objects.get_or_create(
            supabase_uid=supabase_uid,  # Correcting the field name
            defaults={"email": user_email, "full_name": user_data.get("full_name", "")}
        )

        # Accept the invite
        invite.accepted = True
        invite.invite_status = "accepted"
        invite.user = user_profile  # Assign the correct UserProfile instance
        invite.save()

        return Response({"message": "Invitation accepted successfully.", "organization": invite.organization.slug}, status=status.HTTP_200_OK)



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
