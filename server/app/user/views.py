from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from user.serializers import ProfileSerializer, UserWithProfileSerializer
from user.models import User, Profile
from rest_framework.views import APIView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import logging
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

class ProfileView(generics.RetrieveUpdateAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = ProfileSerializer

  def get_object(self):
    return self.request.user.profile

  def perform_update(self, serializer):
    # Since this is receiving fields from the user model as well,
    # segregating the fields to update profile and user is needed
    user_data = {}
    profile_data = {}
    
    # Extract user fields from request data
    for field in ['first_name', 'last_name', 'email']:
      if field in self.request.data:
        user_data[field] = self.request.data[field]
    
    # Extract profile fields from request data  
    for field in ['mbti_type', 'age', 'education_level', 'user_course', 'target_study_hours', 'current_grade']:
      if field in self.request.data:
        profile_data[field] = self.request.data[field]
    
    # Update user fields if any provided
    if user_data:
      for key, value in user_data.items():
        setattr(self.request.user, key, value)
      self.request.user.save()
    
    # Update profile fields using serializer (validates data)
    if profile_data:
      serializer.save(**profile_data)
    else:
      serializer.save()
      
  def update(self, request, *args, **kwargs):
    """Override update to handle both user and profile fields"""
    try:
      response = super().update(request, *args, **kwargs)
      return Response({
        "message": "Profile updated successfully",
        "data": response.data
      })
    except Exception as e:
      logger.error(f"Error updating profile: {e}")
      raise ValidationError("An error occurred while updating the profile.")

class UserDetailView(generics.RetrieveAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = UserWithProfileSerializer

  def get_object(self):
     return self.request.user

from django.http import JsonResponse
from app.middleware import ClerkSDK

class ClerkProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({"message": "Clerk authentication successful", "user": str(request.user)})