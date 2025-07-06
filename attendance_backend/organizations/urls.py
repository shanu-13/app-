from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.organization_register, name='organization_register'),
    path('list/', views.organization_list, name='organization_list'),
]