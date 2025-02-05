from rest_framework import serializers
from ..models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['supabase_uid', 'full_name', 'email', 'created_at', 'updated_at', 'tags', 'availability', "location"]
