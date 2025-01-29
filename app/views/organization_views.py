from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.urls import reverse
from ..models import Organization, Membership, UserProfile
from ..serializers.organization_serializers import OrganizationSerializer, MembershipSerializer

class OrganizationView(APIView):
    def get(self, request, slug):
        """Retrieve organization details by slug."""
        organization = get_object_or_404(Organization, slug=slug)
        serializer = OrganizationSerializer(organization)
        return Response(serializer.data)

    def post(self, request):
        """Create an organization."""
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InviteUserToOrganization(APIView):
    """Invite a user to an organization via email."""
    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        email = request.data.get("email")
        user = get_object_or_404(UserProfile, email=email)

        invite, created = Membership.objects.get_or_create(
            user=user, organization=org, defaults={"role": "member"}
        )

        if not created and invite.accepted:
            return Response({"error": "User is already a member"}, status=status.HTTP_400_BAD_REQUEST)

        invite_link = f"http://yourfrontend.com{reverse('accept-invite', args=[invite.id])}"
        send_mail(
            "Organization Invitation",
            f"You've been invited to join {org.name}. Accept your invite here: {invite_link}",
            "no-reply@yourapp.com",
            [email]
        )

        return Response({"message": "Invitation sent"}, status=status.HTTP_200_OK)

class AcceptInviteView(APIView):
    """Accept an invitation to join an organization."""
    def post(self, request, invite_id):
        invite = get_object_or_404(Membership, id=invite_id, accepted=False)
        invite.accepted = True
        invite.save()
        return Response({"message": "Invite accepted"}, status=status.HTTP_200_OK)
