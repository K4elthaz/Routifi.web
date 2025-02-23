from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from .models import UserProfile
from app.supabase import create_supabase_client  # Import Supabase client

supabase = create_supabase_client()  # Initialize Supabase client

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            return None  # Return None instead of raising error to allow other authentication methods

        try:
            response = supabase.auth.get_user(access_token)
            if hasattr(response, 'error') and response.error:
                return None  # Invalid token, return None

            supabase_uid = response.user.id

            # ✅ Retrieve user from database
            try:
                user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)
                return user_profile.user, None  # ✅ Return the linked Django user
            except UserProfile.DoesNotExist:
                return None  # User not found, return None

        except Exception as e:
            raise AuthenticationFailed(f"Token verification failed: {str(e)}")

