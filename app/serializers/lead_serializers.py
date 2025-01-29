from rest_framework import serializers
from ..models import Lead

class LeadSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), required=False)  # ✅ Accept a list of tags

    class Meta:
        model = Lead
        fields = ["id", "organization", "name", "email", "phone", "location", "created_at", "tags"]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])  # ✅ Extract tags
        lead = Lead.objects.create(**validated_data)

        # Process tags
        organization = validated_data["organization"]
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name, organization=organization)
            lead.tags.add(tag)

        return lead
