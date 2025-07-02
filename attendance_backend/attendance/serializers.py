from rest_framework import serializers
from .models import AttendanceRecord, BreakRecord, LeaveRequest, MonthlyLeaveBalance

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
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['user', 'applied_on', 'approved_by']

class MonthlyLeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyLeaveBalance
        fields = '__all__'
        read_only_fields = ['user']