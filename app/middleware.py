import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header
from .supabase import create_supabase_client

# Initialize Supabase client
supabase = create_supabase_client()

class TokenVerificationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # ✅ Allow public endpoints without token verification
        open_endpoints = [
            '/app/login/',
            '/app/token-refresh/',
            '/app/org/leads/'  # 👈 Add this to bypass token check for leads
        ]

        if request.path in open_endpoints:
            return None  # ✅ Skip authentication check for these paths

        token = request.COOKIES.get('access_token')
        if not token:
            return JsonResponse({"error": "Token is missing"}, status=400)

        try:
            response = supabase.auth.get_user(token)
            if hasattr(response, 'error') and response.error:
                if response.error.message == "JWT expired":
                    return None  # ✅ Allow token refresh request
                return JsonResponse({"error": response.error.message}, status=401)

            request.user = response.user

        except Exception as e:
            return JsonResponse({"error": f"Token verification failed: {str(e)}"}, status=401)
