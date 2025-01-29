from rest_framework import serializers
from ..models import Lead

class LeadSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), required=False)  # List of strings for tags

    class Meta:
        model = Lead
        fields = ["id", "organization", "name", "email", "phone", "location", "created_at", "tags"]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])  # Extract tags (list of tag names)
        lead = Lead.objects.create(**validated_data)

        # Directly save the tags as simple string values
        lead.tags = tags_data  # Store tags as a list of strings
        lead.save()

        return lead
