#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_system.settings')
django.setup()

from organizations.models import Organization
from organizations.serializers import OrganizationRegistrationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Test data
test_data = {
    'name': 'Test Company',
    'email': 'test@company.com',
    'phone': '123-456-7890',
    'address': '123 Test St',
    'website': 'https://test.com',
    'admin_username': 'testadmin',
    'admin_password': 'testpass123',
    'admin_email': 'admin@test.com',
    'admin_first_name': 'Test',
    'admin_last_name': 'Admin'
}

try:
    # Test serializer validation
    serializer = OrganizationRegistrationSerializer(data=test_data)
    if serializer.is_valid():
        print("Serializer validation passed")
        
        # Test organization creation
        org = Organization.objects.create(
            name=test_data['name'],
            email=test_data['email'],
            phone=test_data['phone'],
            address=test_data['address'],
            website=test_data['website']
        )
        print(f"Organization created: {org}")
        
        # Test user creation
        user = User.objects.create_user(
            username=test_data['admin_username'],
            email=test_data['admin_email'],
            password=test_data['admin_password'],
            first_name=test_data['admin_first_name'],
            last_name=test_data['admin_last_name']
        )
        user.role = 'admin'
        user.organization = org
        user.save()
        print(f"User created: {user}")
        
        print("Registration test successful!")
        
    else:
        print("Serializer validation failed:")
        print(serializer.errors)
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()