import uuid
from rest_framework import serializers
from ..models import Organization, Membership

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "description", "logo", "api_key", "created_by", "created_at"]
        read_only_fields = ["api_key", "created_by", "created_at"]

    def create(self, validated_data):
        # Generate a unique API key when creating the organization
        validated_data["api_key"] = str(uuid.uuid4().hex)  # Example: 'a3f5e7c2d8b9...'
        return super().create(validated_data)

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = "__all__"
