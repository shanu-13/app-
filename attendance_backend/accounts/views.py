from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.shortcuts import render
from .serializers import UserSerializer, UserCreateSerializer, ProfileUpdateSerializer, OrganizationRegistrationSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        return response

class OrganizationRegistrationView(generics.CreateAPIView):
    serializer_class = OrganizationRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization, admin_user = serializer.save()
        return Response({
            'message': 'Organization registered successfully',
            'admin_username': admin_user.username
        }, status=status.HTTP_201_CREATED)

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can create users'}, status=status.HTTP_403_FORBIDDEN)
        if not request.user.organization:
            return Response({'error': 'Admin must be assigned to an organization'}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[DEBUG] Creating user with data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                employee = serializer.save(organization=request.user.organization)
                print(f"[SUCCESS] Created employee: {employee.username}")
                return Response({
                    'message': 'Employee created successfully',
                    'employee': {
                        'id': employee.id,
                        'username': employee.username,
                        'email': employee.email,
                        'first_name': employee.first_name,
                        'last_name': employee.last_name
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"[ERROR] Failed to create employee: {str(e)}")
                return Response({'error': f'Failed to create employee: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(f"[ERROR] Validation errors: {serializer.errors}")
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_list(request):
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if not request.user.organization:
        return Response({'error': 'No organization assigned'}, status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(
        role='employee', 
        organization=request.user.organization,
        is_active=True
    )
    serializer = UserSerializer(users, many=True)
    # Remove organization details from response
    data = serializer.data
    for user_data in data:
        user_data.pop('organization', None)
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def organizations_dummy(request):
    # Return empty list to prevent frontend 404 errors
    # Organizations are handled internally for confidentiality
    return Response([])

def login_portal(request):
    return render(request, 'login.html')

def admin_dashboard(request):
    return render(request, 'dashboard_admin.html')

def employee_dashboard(request):
    return render(request, 'dashboard_employee.html')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password changed successfully'})