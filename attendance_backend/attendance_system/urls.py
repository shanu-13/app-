"""
URL configuration for attendance_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Professional Attendance Management System',
        'endpoints': {
            'auth': '/api/auth/',
            'attendance': '/api/attendance/'
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('dashboard/admin/', lambda request: __import__('accounts.views', fromlist=['admin_dashboard']).admin_dashboard(request), name='admin_dashboard'),
    path('dashboard/employee/', lambda request: __import__('accounts.views', fromlist=['employee_dashboard']).employee_dashboard(request), name='employee_dashboard'),
    path('api/organizations/', include('organizations.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/attendance/', include('attendance.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
