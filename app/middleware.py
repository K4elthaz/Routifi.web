import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header
from .supabase import create_supabase_client

# Initialize Supabase client
supabase = create_supabase_client()

class TokenVerificationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == '/app/login/' or request.path == '/app/token-refresh/':  # ✅ Allow refresh requests
            return None

        token = request.COOKIES.get('access_token')
        if not token:
            return JsonResponse({"error": "Token is missing"}, status=400)

        try:
            response = supabase.auth.get_user(token)
            if hasattr(response, 'error') and response.error:
                if response.error.message == "JWT expired":
                    return None  # ✅ Allow refresh request to proceed
                return JsonResponse({"error": response.error.message}, status=401)

            request.user = response.user

        except Exception as e:
            return JsonResponse({"error": f"Token verification failed: {str(e)}"}, status=401)

