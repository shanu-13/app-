from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class AttendanceRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_present = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"

class BreakRecord(models.Model):
    attendance = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name='breaks')
    break_start = models.DateTimeField()
    break_end = models.DateTimeField(null=True, blank=True)
    break_duration = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.attendance.user.username} - Break on {self.attendance.date}"

class LeaveRequest(models.Model):
    LEAVE_TYPES = [
        ('sick', 'Sick Leave'),
        ('half_day', 'Half Day'),
        ('full_day', 'Full Day'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    
    def __str__(self):
        return f"{self.user.username} - {self.leave_type} ({self.start_date})"

class MonthlyLeaveBalance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    total_allowed = models.IntegerField(default=4)
    used_leaves = models.IntegerField(default=0)
    remaining_leaves = models.IntegerField(default=4)
    
    class Meta:
        unique_together = ['user', 'year', 'month']
    
    def __str__(self):
        return f"{self.user.username} - {self.month}/{self.year}"