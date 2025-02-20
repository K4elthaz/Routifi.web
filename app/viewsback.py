from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserProfile
from .serializers import UserProfileSerializer
from .supabase import create_supabase_client
from django.http import JsonResponse

supabase = create_supabase_client()

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserProfile
from .serializers import UserProfileSerializer
from .supabase import create_supabase_client
from django.http import JsonResponse

supabase = create_supabase_client()

class UserProfileView(APIView):
    def post(self, request):
        """
        Register a user in Supabase Auth and save it to the Django database.
        """
        email = request.data.get("email")
        password = request.data.get("password")  # Ensure the user provides a password for Supabase
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        date_of_birth = request.data.get("date_of_birth")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Register the user in Supabase Auth
        try:
            response = supabase.auth.sign_up({"email": email, "password": password})

            # ✅ Correct way to check if there is an error
            if response and hasattr(response, "errors") and response.errors:
                return Response({"error": response.errors.message}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Correct way to get user data
            supabase_user = response.user
            if not supabase_user:
                return Response({"error": "Failed to retrieve user from Supabase"}, status=status.HTTP_400_BAD_REQUEST)

            supabase_uid = getattr(supabase_user, "id", None)  # Extract UID from the user object

            if not supabase_uid:
                return Response({"error": "User ID missing from Supabase response"}, status=status.HTTP_400_BAD_REQUEST)

            # Step 2: Save user details in Django database
            user_data = {
                "supabase_uid": supabase_uid,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "date_of_birth": date_of_birth,
            }

            serializer = UserProfileSerializer(data=user_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, supabase_uid):
        """
        Update user profile details.
        """
        try:
            user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)
            serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, supabase_uid):
        """
        Delete user from Django and Supabase.
        """
        try:
            user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)

            # Step 1: Delete user from Supabase
            try:
                response = supabase.auth.admin.delete_user(user_profile.supabase_uid)
                if response.error:
                    return Response({"error": f"Failed to delete user from Supabase: {response.error.message}"}, 
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                return Response({"error": f"Failed to delete user from Supabase: {str(e)}"}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Step 2: Delete user from Django database
            user_profile.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def get(self, request, supabase_uid):
        try:
            user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

def verify_supabase_token(request):
    """
    Verify the Supabase authentication token.
    """
    token = request.headers.get("Authorization", "")
    if not token.startswith("Bearer "):
        return JsonResponse({"error": "Invalid or missing token"}, status=401)

    token = token.split("Bearer ")[-1]
    try:
        response = supabase.auth.get_user(token)
        if response.error:
            return JsonResponse({"error": response.error.message}, status=401)

        return JsonResponse({"message": "Token is valid", "user": response.user})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=401)


class UserLoginView(APIView):
    def post(self, request):
        """
        Authenticate a user using Supabase and return their profile data.
        """
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 1: Authenticate with Supabase
            response = supabase.auth.sign_in_with_password({"email": email, "password": password})

            if response and hasattr(response, "errors") and response.errors:
                return Response({"error": response.errors.message}, status=status.HTTP_400_BAD_REQUEST)

            supabase_user = response.user
            if not supabase_user:
                return Response({"error": "Failed to retrieve user from Supabase"}, status=status.HTTP_400_BAD_REQUEST)

            supabase_uid = getattr(supabase_user, "id", None)
            if not supabase_uid:
                return Response({"error": "User ID missing from Supabase response"}, status=status.HTTP_400_BAD_REQUEST)

            # Step 2: Retrieve user profile from Django database
            try:
                user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)
            except UserProfile.DoesNotExist:
                return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

            # Step 3: Return user data and authentication token
            serializer = UserProfileSerializer(user_profile)
            return Response({
                "user": serializer.data,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
