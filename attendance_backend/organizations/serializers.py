from rest_framework import serializers
from .models import Organization, OrganizationAdmin

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'email', 'phone', 'address', 'website', 'logo', 'subscription_plan', 'created_at']

class OrganizationRegistrationSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(write_only=True)
    admin_email = serializers.EmailField(write_only=True)
    admin_first_name = serializers.CharField(write_only=True)
    admin_last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Organization
        fields = ['name', 'email', 'phone', 'address', 'website', 'admin_username', 'admin_password', 'admin_email', 'admin_first_name', 'admin_last_name']