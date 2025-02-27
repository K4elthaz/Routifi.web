import uuid
from rest_framework import serializers
from ..models import Organization, Membership

class OrganizationSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "description", "logo", "created_by", "created_at", "api_key", "members"]  # "members" added to fields
        read_only_fields = ["api_key", "created_by", "created_at"]

    def get_members(self, obj):
        # Ensure you're filtering by accepted members
        members = obj.members.filter(accepted=True)
        return [{"id": m.user.supabase_uid, "name": f"{m.user.full_name}", "email": m.user.email, "role": m.role} for m in members]

    def to_representation(self, instance):
        """Customize response based on user role."""
        data = super().to_representation(instance)
        user_profile = self.context.get("user_profile")  # Get user profile from context

        if not user_profile:
            return {}  # Ensure an authenticated user exists

        # Check if the user is the creator (owner) of the organization
        if instance.created_by == user_profile:
            return data  # Owners get full details, including API key

        # Check if the user is a member with `accepted=True`
        is_member = Membership.objects.filter(
            user=user_profile, organization=instance, accepted=True
        ).exists()

        if is_member:
            return {
                "id": data["id"],
                "name": data["name"],
                "slug": data["slug"],
                "description": data["description"],
                "logo": data["logo"],
                "created_at": data["created_at"],
            }  # Exclude `api_key` for non-owners

        return {}  # Return empty object instead of None to avoid issues

    def create(self, validated_data):
        # Generate a unique API key when creating the organization
        validated_data["api_key"] = str(uuid.uuid4().hex)
        return super().create(validated_data)


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = "__all__"
