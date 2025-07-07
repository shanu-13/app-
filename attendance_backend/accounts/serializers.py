from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from organizations.models import Organization

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'employee_id', 'phone', 'profile_picture', 'project', 
                 'designation', 'date_joined_company', 'is_active']
        read_only_fields = ['id']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                 'role', 'employee_id', 'project', 'designation', 'date_joined_company']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.setdefault('role', 'employee')
        organization = self.context['request'].user.organization if 'request' in self.context and hasattr(self.context['request'].user, 'organization') else None
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'employee'),
            employee_id=validated_data.get('employee_id', ''),
            project=validated_data.get('project', ''),
            designation=validated_data.get('designation', ''),
            date_joined_company=validated_data.get('date_joined_company'),
            organization=organization
        )
        return user

class OrganizationRegistrationSerializer(serializers.Serializer):
    organization_name = serializers.CharField(max_length=200)
    organization_email = serializers.EmailField()
    admin_username = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True, min_length=8)
    admin_first_name = serializers.CharField(max_length=30)
    admin_last_name = serializers.CharField(max_length=30)
    
    def validate_admin_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_organization_email(self, value):
        if Organization.objects.filter(email=value).exists():
            raise serializers.ValidationError("Organization email already exists")
        return value
    
    def create(self, validated_data):
        # Create organization
        organization = Organization.objects.create(
            name=validated_data['organization_name'],
            email=validated_data['organization_email']
        )
        
        # Create admin user
        admin_user = User.objects.create_user(
            username=validated_data['admin_username'],
            email=validated_data['admin_email'],
            password=validated_data['admin_password'],
            first_name=validated_data['admin_first_name'],
            last_name=validated_data['admin_last_name'],
            role='admin',
            organization=organization
        )
        
        return organization, admin_user

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'profile_picture']