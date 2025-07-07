from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def organizations_list_dummy(request):
    return Response([])

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_registration(request):
    return Response({
        'status': 'Registration endpoint is working',
        'endpoint': '/api/organizations/register/',
        'method': 'POST',
        'required_fields': [
            'name (organization name)',
            'email (organization email)', 
            'admin_username',
            'admin_email',
            'admin_password'
        ]
    })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def organizations_register_dummy(request):
    from organizations.models import Organization
    from django.contrib.auth import get_user_model
    from django.db import transaction
    
    User = get_user_model()
    data = request.data
    
    print(f"[DEBUG] Registration data: {data}")
    
    # Extract fields
    org_name = str(data.get('name', '')).strip()
    org_email = str(data.get('email', '')).strip()
    admin_username = str(data.get('admin_username', '')).strip()
    admin_email = str(data.get('admin_email', '')).strip()
    admin_password = str(data.get('admin_password', '')).strip()
    admin_first_name = str(data.get('admin_first_name', '')).strip()
    admin_last_name = str(data.get('admin_last_name', '')).strip()
    
    print(f"[DEBUG] Processing: {org_name} | {admin_username} | {admin_email}")
    
    # Validation
    if not org_name:
        return Response({'error': 'Organization name is required'}, status=400)
    if not org_email:
        return Response({'error': 'Organization email is required'}, status=400)
    if not admin_username:
        return Response({'error': 'Admin username is required'}, status=400)
    if not admin_email:
        return Response({'error': 'Admin email is required'}, status=400)
    if not admin_password:
        return Response({'error': 'Admin password is required'}, status=400)
    
    try:
        # Check duplicates with detailed logging
        if Organization.objects.filter(email=org_email).exists():
            print(f"[ERROR] Organization email {org_email} already exists")
            return Response({'error': 'Organization email already exists'}, status=400)
        
        if User.objects.filter(username=admin_username).exists():
            print(f"[ERROR] Username {admin_username} already taken")
            return Response({'error': 'Username already taken'}, status=400)
        
        if User.objects.filter(email=admin_email).exists():
            print(f"[ERROR] Email {admin_email} already registered")
            return Response({'error': 'Email already registered'}, status=400)
        
        print(f"[DEBUG] All validations passed, creating organization...")
        
        # Create organization and user
        with transaction.atomic():
            organization = Organization.objects.create(
                name=org_name,
                email=org_email,
                phone=data.get('phone', ''),
                address=data.get('address', ''),
                website=data.get('website', ''),
                is_active=True
            )
            
            admin_user = User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                first_name=admin_first_name,
                last_name=admin_last_name,
                role='admin',
                organization=organization,
                is_active=True
            )
            
            print(f"[SUCCESS] Created: {org_name} with admin: {admin_username}")
            
            return Response({
                'message': 'Organization registered successfully',
                'organization': {
                    'id': organization.id,
                    'name': organization.name,
                    'admin_username': admin_user.username,
                    'admin_email': admin_user.email
                }
            }, status=201)
            
    except Exception as e:
        print(f"[ERROR] Registration exception: {str(e)}")
        print(f"[ERROR] Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Registration failed: {str(e)}'}, status=500)

urlpatterns = [
    path('', organizations_list_dummy, name='organizations_list'),
    path('list/', organizations_list_dummy, name='organizations_list_alt'),
    path('register/', organizations_register_dummy, name='organizations_register'),
    path('test/', test_registration, name='test_registration'),
]