from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import UserProfile
from ..serializers.user_serializers import UserProfileSerializer
from ..supabase import create_supabase_client
from django.http import JsonResponse


supabase = create_supabase_client()

class UserProfileView(APIView):
    def post(self, request):
        """
        Register a user in Supabase Auth and save it to the Django database.
        """
        email = request.data.get("email")
        password = request.data.get("password")  # Ensure the user provides a password for Supabase
        full_name = request.data.get("full_name")
        location = request.data.get("location")

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
                "full_name": full_name,
                "location": location,
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

        # Debugging: Print the full response
        print(response)

        # Check if there's an error in the response
        if hasattr(response, 'error') and response.error:
            return JsonResponse({"error": response.error.message}, status=401)

        # Manually convert the user object to a dictionary
        user_data = {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
            "location": response.user.user_metadata.get("location", []),
            # Add any other relevant fields from the user object
        }

        # Return the user data as a JSON response
        return JsonResponse({"message": "Token is valid", "user": user_data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=401)

class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Authenticate with Supabase
            auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})

            # Handle authentication errors
            if auth_response and hasattr(auth_response, "errors") and auth_response.errors:
                return Response({"error": auth_response.errors.message}, status=status.HTTP_400_BAD_REQUEST)

            supabase_user = auth_response.user
            if not supabase_user:
                return Response({"error": "Failed to retrieve user from Supabase"}, status=status.HTTP_400_BAD_REQUEST)

            supabase_uid = getattr(supabase_user, "id", None)
            if not supabase_uid:
                return Response({"error": "User ID missing from Supabase response"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user_profile = UserProfile.objects.get(supabase_uid=supabase_uid)
            except UserProfile.DoesNotExist:
                return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = UserProfileSerializer(user_profile)

            session_data = auth_response.session
            access_token = session_data.access_token if session_data else None
            refresh_token = session_data.refresh_token if session_data else None


            if not access_token or not refresh_token:
                return Response({"error": "Failed to retrieve authentication tokens"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            response = JsonResponse({"user": serializer.data, "access_token": access_token, "refresh_token": refresh_token}, status=200)

            response.set_cookie(
                "access_token", 
                access_token,
                httponly=True,
                secure=True,
                samesite="Lax"
            )
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=True,
                samesite="Lax"
            )

            return response

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token is missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_session = supabase.auth.refresh_session({"refresh_token": refresh_token})

            if hasattr(new_session, "errors") and new_session.errors:
                return Response({"error": new_session.errors.message}, status=status.HTTP_400_BAD_REQUEST)

            response = JsonResponse({"message": "Token refreshed"}, status=200)
            response.set_cookie("access_token", new_session.session.access_token, httponly=True, secure=True)
            return response

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    def post(self, request):
        response = JsonResponse({"message": "Logged out successfully"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


