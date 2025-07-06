from django.contrib import admin
from .models import Organization, OrganizationAdmin

@admin.register(Organization)
class OrganizationModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subscription_plan', 'is_active', 'created_at']
    list_filter = ['subscription_plan', 'is_active', 'created_at']
    search_fields = ['name', 'email']

@admin.register(OrganizationAdmin)
class OrganizationAdminModelAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'created_at']
    list_filter = ['organization', 'created_at']