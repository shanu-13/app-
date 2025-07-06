from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'employee_id', 'phone', 'profile_picture', 'project', 
                 'designation', 'date_joined_company', 'is_active', 'organization_name']
        read_only_fields = ['id', 'organization_name']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                 'role', 'employee_id', 'project', 'designation', 'date_joined_company']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.setdefault('role', 'employee')
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
            date_joined_company=validated_data.get('date_joined_company')
        )
        return user

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'profile_picture']