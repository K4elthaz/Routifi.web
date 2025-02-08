from rest_framework import serializers
from ..models import Lead

class LeadSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)  # Ensure tags default to an empty list

    class Meta:
        model = Lead
        fields = ["id", "organization", "name", "email", "phone", "location", "created_at", "tags"]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])  # Default to empty list if no tags are provided
        lead = Lead.objects.create(**validated_data)
        
        # Ensure tags are saved as a list (even if empty)
        lead.tags = tags_data if tags_data else []  # Make sure we don't assign None to tags
        lead.save()

        return lead
