import datetime
import os
import requests
import jwt
import pytz
from django.contrib.auth import get_user_model
from django.core.cache import cache
from jwt.algorithms import RSAAlgorithm
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from dotenv import load_dotenv
from user.models import Profile, UserActivity

# Load .env file
load_dotenv()

User = get_user_model()

CLERK_API_URL = "https://api.clerk.com/v1"
CLERK_FRONTEND_API_URL = os.getenv("CLERK_FRONTEND_API_URL")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CACHE_KEY = "jwks_data"


import time
import logging

logger = logging.getLogger(__name__)

class ClerkSDK:
    """Handles Clerk-related API interactions."""
    def fetch_user_info(self, user_id: str):
        """Fetch user info from Clerk API."""
        user_info = cache.get(f"user_info_{user_id}")

        if user_info:
            return {
                "email_address": user_info["email_addresses"][0]["email_address"],
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "last_login": datetime.datetime.fromtimestamp(
                    user_info["last_sign_in_at"] / 1000, tz=pytz.UTC
                ),
            }, True

        response = requests.get(
            f"{CLERK_API_URL}/users/{user_id}",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        )

        if response.status_code == 200:
            data = response.json()
            # set cache
            cache.set(f"user_info_{user_id}", data, 60 * 60 * 24)
            return {
                "email_address": data["email_addresses"][0]["email_address"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "last_login": datetime.datetime.fromtimestamp(
                    data["last_sign_in_at"] / 1000, tz=pytz.UTC
                ),
            }, True
        else:
            return {
                "email_address": "",
                "first_name": "",
                "last_name": "",
                "last_login": None,
            }, False

    def get_jwks(self):
        """Get JWKS data for JWT verification."""
        jwks_data = cache.get(CACHE_KEY)
        if not jwks_data:
            response = requests.get(f"{CLERK_FRONTEND_API_URL}/.well-known/jwks.json")
            if response.status_code == 200:
                jwks_data = response.json()
                cache.set(CACHE_KEY, jwks_data)  # Cache indefinitely
            else:
                raise AuthenticationFailed("Failed to fetch JWKS.")
        return jwks_data


class JWTAuthenticationMiddleware(BaseAuthentication):
    """Custom middleware for JWT Authentication."""
    def __init__(self):
        self.clerk_sdk = ClerkSDK()  # Instantiate ClerkSDK once

    def authenticate(self, request):
        """Authenticate user using JWT."""
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            token = auth_header.split(" ")[1]  # Extract the token
        except IndexError:
            raise AuthenticationFailed("Bearer token not provided.")
        # Decode the JWT and fetch the associated user
        user = self.decode_jwt(token)

        if not user:
            return None

        return user, None

    def decode_jwt(self, token):
        """Decode JWT to get user ID."""

        jwks_data = self.clerk_sdk.get_jwks()
        public_key = RSAAlgorithm.from_jwk(jwks_data["keys"][0])  # Get public key

        try:
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_signature": True},
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.DecodeError as e:
            print(e)
            raise AuthenticationFailed("Token decode error.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        user_id = payload.get("sub")  # Get user ID from payload

        logger.info(f"[CLERK AUTH] Processing user_id: {user_id} at {time.time()}")
        if user_id:
            get_or_create_start = time.time()
            try:
                # Use get_or_create to handle race conditions
                user, created = User.objects.get_or_create(
                    username=user_id,
                    defaults={
                        'first_name': '',
                        'last_name': '',
                        'email': '',
                    }
                )
                
                # If user was just created, fetch info from Clerk and update
                if created:
                    info, found = self.clerk_sdk.fetch_user_info(user_id)
                    if found:
                        user.first_name = info["first_name"]
                        user.last_name = info["last_name"]
                        user.email = info["email_address"]
                        user.save()
                    
                    # Create related objects for new users
                    Profile.objects.get_or_create(user=user)
                    UserActivity.objects.get_or_create(user=user)
                    
            except Exception as e:
                logger.error(f"Error creating/getting user {user_id}: {e}")
                return None
                
            get_or_create_end = time.time()
            logger.info(f"Time to get or create user: {get_or_create_end - get_or_create_start:.3f} seconds")
            
            if created:
                logger.info(f"User {user_id} created in database")
                
            return user
        return None
