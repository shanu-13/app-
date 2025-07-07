from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Organization, OrganizationAdmin
from .serializers import OrganizationSerializer, OrganizationRegistrationSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([])
def organization_register(request):
    try:
        data = request.data
        # Check for existing organization email
        if Organization.objects.filter(email=data['email']).exists():
            return Response({'message': 'An organization with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create organization
        organization = Organization.objects.create(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            website=data.get('website', '')
        )
        
        # Create admin user
        admin_user = User.objects.create_user(
            username=data['admin_username'],
            email=data['admin_email'],
            password=data['admin_password'],
            first_name=data['admin_first_name'],
            last_name=data['admin_last_name']
        )
        admin_user.role = 'admin'
        admin_user.organization = organization
        admin_user.is_active = True  # Ensure user is active
        admin_user.save()
        print(f"[DEBUG] Created admin user: username={admin_user.username}, password={data['admin_password']}, is_active={admin_user.is_active}")
        
        # Create organization admin relationship
        OrganizationAdmin.objects.create(
            organization=organization,
            user=admin_user
        )
        
        return Response({
            'message': 'Organization registered successfully',
            'organization': {
                'id': organization.id,
                'name': organization.name,
                'admin_username': admin_user.username,
                'admin_email': admin_user.email,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"[ERROR] Organization registration failed: {e}")
        return Response({'message': 'Registration failed', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Organization list removed for confidentiality - no public organization visibility