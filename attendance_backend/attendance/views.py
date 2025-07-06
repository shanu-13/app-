from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime, timedelta
from .models import AttendanceRecord, BreakRecord, LeaveRequest, MonthlyLeaveBalance, Notification
from .serializers import AttendanceRecordSerializer, BreakRecordSerializer, LeaveRequestSerializer, MonthlyLeaveBalanceSerializer, NotificationSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clock_in(request):
    today = timezone.now().date()
    attendance, created = AttendanceRecord.objects.get_or_create(
        user=request.user, 
        date=today,
        defaults={'clock_in': timezone.now(), 'is_present': True}
    )
    
    if not created and attendance.clock_in:
        return Response({'error': 'Already clocked in today'}, status=status.HTTP_400_BAD_REQUEST)
    
    attendance.clock_in = timezone.now()
    attendance.is_present = True
    attendance.save()
    
    return Response({'message': 'Clocked in successfully', 'time': attendance.clock_in})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clock_out(request):
    today = timezone.now().date()
    try:
        attendance = AttendanceRecord.objects.get(user=request.user, date=today)
    except AttendanceRecord.DoesNotExist:
        return Response({'error': 'No clock-in record found'}, status=status.HTTP_400_BAD_REQUEST)
    
    if attendance.clock_out:
        return Response({'error': 'Already clocked out today'}, status=status.HTTP_400_BAD_REQUEST)
    
    attendance.clock_out = timezone.now()
    
    # Calculate total hours
    if attendance.clock_in:
        total_time = attendance.clock_out - attendance.clock_in
        break_time = attendance.breaks.aggregate(Sum('break_duration'))['break_duration__sum'] or 0
        attendance.total_hours = (total_time.total_seconds() / 3600) - float(break_time)
    
    attendance.save()
    
    return Response({'message': 'Clocked out successfully', 'time': attendance.clock_out, 'total_hours': attendance.total_hours})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def attendance_today(request):
    today = timezone.now().date()
    try:
        attendance = AttendanceRecord.objects.get(user=request.user, date=today)
        serializer = AttendanceRecordSerializer(attendance)
        return Response(serializer.data)
    except AttendanceRecord.DoesNotExist:
        return Response({'message': 'No attendance record for today'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def attendance_history(request):
    records = AttendanceRecord.objects.filter(user=request.user).order_by('-date')[:30]
    serializer = AttendanceRecordSerializer(records, many=True)
    return Response(serializer.data)

class LeaveRequestCreateView(generics.CreateAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leave_balance(request):
    now = timezone.now()
    balance, created = MonthlyLeaveBalance.objects.get_or_create(
        user=request.user,
        year=now.year,
        month=now.month,
        defaults={'total_allowed': 4, 'used_leaves': 0, 'remaining_leaves': 4}
    )
    serializer = MonthlyLeaveBalanceSerializer(balance)
    return Response(serializer.data)

# Admin Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_attendance_report(request):
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if not request.user.organization:
        return Response({'error': 'No organization assigned'}, status=status.HTTP_400_BAD_REQUEST)
    
    now = timezone.now()
    records = AttendanceRecord.objects.filter(
        date__year=now.year,
        date__month=now.month,
        user__organization=request.user.organization,
        user__is_active=True
    ).select_related('user')
    
    serializer = AttendanceRecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leave_requests(request):
    if not request.user.organization:
        return Response({'error': 'No organization assigned'}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.user.role == 'admin':
        requests = LeaveRequest.objects.filter(
            user__organization=request.user.organization,
            user__is_active=True
        ).select_related('user')
    else:
        requests = LeaveRequest.objects.filter(user=request.user)
    
    serializer = LeaveRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def employees_leave_management(request):
    """Get all employees in organization with their leave information for admin management"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if not request.user.organization:
        return Response({'error': 'No organization assigned'}, status=status.HTTP_400_BAD_REQUEST)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    employees = User.objects.filter(
        organization=request.user.organization,
        role='employee',
        is_active=True
    ).prefetch_related('leaverequest_set')
    
    employee_data = []
    for employee in employees:
        # Get recent leave requests
        recent_leaves = employee.leaverequest_set.all()[:5]
        
        # Get current month leave balance
        now = timezone.now()
        balance, _ = MonthlyLeaveBalance.objects.get_or_create(
            user=employee,
            year=now.year,
            month=now.month,
            defaults={'total_allowed': 4, 'used_leaves': 0, 'remaining_leaves': 4}
        )
        
        employee_data.append({
            'id': employee.id,
            'employee_id': employee.employee_id,
            'name': f"{employee.first_name} {employee.last_name}",
            'username': employee.username,
            'email': employee.email,
            'designation': employee.designation,
            'project': employee.project,
            'leave_balance': {
                'total_allowed': balance.total_allowed,
                'used_leaves': balance.used_leaves,
                'remaining_leaves': balance.remaining_leaves
            },
            'recent_leave_requests': LeaveRequestSerializer(recent_leaves, many=True).data
        })
    
    return Response(employee_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_organization_users(request):
    """Debug endpoint to check organization assignments"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    debug_info = {
        'current_admin': {
            'id': request.user.id,
            'username': request.user.username,
            'organization_id': request.user.organization.id if request.user.organization else None,
            'organization_name': request.user.organization.name if request.user.organization else None,
        },
        'all_users_in_org': [],
        'leave_requests_in_org': []
    }
    
    if request.user.organization:
        # Get all users in the same organization
        org_users = User.objects.filter(organization=request.user.organization)
        for user in org_users:
            debug_info['all_users_in_org'].append({
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'is_active': user.is_active,
                'employee_id': user.employee_id,
                'organization_id': user.organization.id if user.organization else None
            })
        
        # Get all leave requests in the organization
        leave_requests = LeaveRequest.objects.filter(
            user__organization=request.user.organization
        ).select_related('user')
        
        for leave in leave_requests:
            debug_info['leave_requests_in_org'].append({
                'id': leave.id,
                'user_id': leave.user.id,
                'username': leave.user.username,
                'employee_id': leave.user.employee_id,
                'leave_type': leave.leave_type,
                'status': leave.status,
                'start_date': str(leave.start_date),
                'user_is_active': leave.user.is_active
            })
    
    return Response(debug_info)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def approve_leave(request, leave_id):
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        leave_request = LeaveRequest.objects.get(id=leave_id)
        leave_request.status = 'approved'
        leave_request.approved_by = request.user
        leave_request.save()
        
        # Create notification
        try:
            Notification.objects.create(
                user=leave_request.user,
                title='Leave Request Approved',
                message=f'Your {leave_request.leave_type} leave request from {leave_request.start_date} to {leave_request.end_date} has been approved.',
                notification_type='leave_approved'
            )
        except Exception:
            pass
        
        return Response({'message': 'Leave approved'})
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def reject_leave(request, leave_id):
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        leave_request = LeaveRequest.objects.get(id=leave_id)
        leave_request.status = 'rejected'
        leave_request.approved_by = request.user
        leave_request.save()
        
        # Create notification
        try:
            Notification.objects.create(
                user=leave_request.user,
                title='Leave Request Rejected',
                message=f'Your {leave_request.leave_type} leave request from {leave_request.start_date} to {leave_request.end_date} has been rejected.',
                notification_type='leave_rejected'
            )
        except Exception:
            pass
        
        return Response({'message': 'Leave rejected'})
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notifications(request):
    try:
        notifications = Notification.objects.filter(user=request.user)[:20]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    except Exception:
        return Response([])

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)