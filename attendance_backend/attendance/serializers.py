from rest_framework import serializers
from .models import AttendanceRecord, BreakRecord, LeaveRequest, MonthlyLeaveBalance, Notification
from accounts.serializers import UserSerializer

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['user', 'total_hours']

class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = '__all__'
        read_only_fields = ['break_duration']

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['user', 'applied_on', 'approved_by']
    
    def get_employee_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_employee_id(self, obj):
        return obj.user.employee_id or 'N/A'

class MonthlyLeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyLeaveBalance
        fields = '__all__'
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']