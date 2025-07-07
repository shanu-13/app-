from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('portal/', views.login_portal, name='login_portal'),
    path('organizations/', views.organizations_dummy, name='organizations_dummy'),
    path('register-organization/', views.OrganizationRegistrationView.as_view(), name='register_organization'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-user/', views.UserCreateView.as_view(), name='create_user'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile_update'),
    path('users/', views.user_list, name='user_list'),
    path('change-password/', views.change_password, name='change_password'),
]