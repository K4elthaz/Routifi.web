import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header
from .supabase import create_supabase_client

# Initialize Supabase client
supabase = create_supabase_client()

class TokenVerificationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip token verification for login route
        if request.path == '/app/login/':
            return None
        
        # Get the token from the cookies first
        token = request.COOKIES.get('access_token')
        
        # If not in cookies, check Authorization header
        if not token:
            auth_header = get_authorization_header(request)
            if auth_header:
                token = auth_header.decode('utf-8').split(' ')[-1]

        # If there's no token, return error
        if not token:
            return JsonResponse({"error": "Token is missing"}, status=400)

        try:
            # Verify token with Supabase
            response = supabase.auth.get_user(token)

            if hasattr(response, 'error') and response.error:
                return JsonResponse({"error": response.error.message}, status=401)

            # If valid, set the user in the request
            request.user = response.user

        except Exception as e:
            return JsonResponse({"error": f"Token verification failed: {str(e)}"}, status=401)
