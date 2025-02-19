from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from .models import UserProfile
from app.supabase import create_supabase_client  # ✅ Import Supabase client

supabase = create_supabase_client()  # ✅ Initialize Supabase client

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            raise AuthenticationFailed("Token is missing")

        # ✅ Instead of calling verify_supabase_token(), call Supabase directly
        try:
            response = supabase.auth.get_user(access_token)

            if hasattr(response, 'error') and response.error:
                raise AuthenticationFailed(response.error.message)

            user_data = {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": response.user.user_metadata.get("full_name", ""),
                "location": response.user.user_metadata.get("location", []),
            }

        except Exception as e:
            raise AuthenticationFailed(f"Token verification failed: {str(e)}")

        # ✅ Retrieve user from database
        try:
            user_profile = UserProfile.objects.get(supabase_uid=user_data["id"])
        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("User profile not found")

        # ✅ Ensure user is active
        user_profile.is_active = True

        return user_profile, None  # DRF expects a user instance and None
