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
        admin_user.save()
        
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
                'email': organization.email
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([])
def organization_list(request):
    organizations = Organization.objects.filter(is_active=True)
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data)