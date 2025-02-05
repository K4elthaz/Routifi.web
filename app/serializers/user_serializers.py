from rest_framework import serializers
from ..models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['supabase_uid', 'first_name', 'last_name', 'email', 'date_of_birth', 'created_at', 'updated_at', 'tags', 'availability']
