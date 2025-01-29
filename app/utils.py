import os
from django.conf import settings
from apps.supabase import create_supabase_client
supabase = create_supabase_client()

def generate_access_token(length=16):
    """Generates a secure random access token with the specified length.

    Args:
        length (int): The length of the access token. Default is 16.

    Returns:
        str: The generated access token.
    """
    characters = string.ascii_letters + string.digits
    token = "".join(secrets.choice(characters) for _ in range(length))
    return token