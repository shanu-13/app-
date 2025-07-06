from django.urls import path
from . import views

urlpatterns = [
    path('clock-in/', views.clock_in, name='clock_in'),
    path('clock-out/', views.clock_out, name='clock_out'),
    path('today/', views.attendance_today, name='attendance_today'),
    path('history/', views.attendance_history, name='attendance_history'),
    path('leave/request/', views.LeaveRequestCreateView.as_view(), name='leave_request'),
    path('leave/balance/', views.leave_balance, name='leave_balance'),
    path('leave/requests/', views.leave_requests, name='leave_requests'),
    path('employees/leave-management/', views.employees_leave_management, name='employees_leave_management'),
    path('debug/organization-users/', views.debug_organization_users, name='debug_organization_users'),
    path('leave/<int:leave_id>/approve/', views.approve_leave, name='approve_leave'),
    path('leave/<int:leave_id>/reject/', views.reject_leave, name='reject_leave'),
    path('admin/report/', views.admin_attendance_report, name='admin_report'),
    path('notifications/', views.notifications, name='notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
]