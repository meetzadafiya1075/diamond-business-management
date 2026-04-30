from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin / Owner'),
        ('OFFICE', 'Office / Admin'),
        ('INVENTORY', 'Inventory / Admin'),
        ('PLANNER', 'Planner'),
        ('PRODUCTION_MANAGER', 'Production Manager'),
        ('SUPERVISOR', 'Supervisor'),
        ('WORKER', 'Worker'),
        ('SALES', 'Sales / Inventory'),
        ('ACCOUNTANT', 'Accountant'),
    )
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='OFFICE')

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action}"

class WorkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile', limit_choices_to={'role': 'WORKER'})
    skills = models.CharField(max_length=255, blank=True, null=True, help_text="Comma separated skills, e.g., Sawing, Polishing")
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.00, help_text="Efficiency percentage")
    
    def __str__(self):
        return f"Profile: {self.user.username}"
