from django.db import models
from users.models import User

class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class RoughParcel(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='parcels')
    parcel_name = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField()
    carat_weight = models.DecimalField(max_digits=10, decimal_places=3)
    cost_per_carat = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    invoice_file = models.FileField(upload_to='invoices/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.carat_weight and self.cost_per_carat:
            self.total_cost = self.carat_weight * self.cost_per_carat
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.parcel_name} ({self.carat_weight} ct)"

class ParcelTracking(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New Purchase'),
        ('IN_INVENTORY', 'In Inventory'),
        ('IN_PLANNING', 'In Planning'),
        ('IN_PRODUCTION', 'In Production'),
        ('POLISHED', 'Polished (Completed)'),
        ('SOLD', 'Sold'),
    )
    
    parcel = models.OneToOneField(RoughParcel, on_delete=models.CASCADE, related_name='tracking')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NEW')
    location = models.CharField(max_length=100, default='Main Safe')
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.parcel.parcel_name} - {self.status}"

class PlanningRecord(models.Model):
    parcel = models.OneToOneField(RoughParcel, on_delete=models.CASCADE, related_name='planning')
    planner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='planning_assignments')
    expected_yield_percent = models.DecimalField(max_digits=5, decimal_places=2)
    expected_polished_carats = models.DecimalField(max_digits=10, decimal_places=3)
    planning_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan for {self.parcel.parcel_name}"

class ProductionJob(models.Model):
    STAGE_CHOICES = (
        ('MARKING', 'Marking'),
        ('SAWING', 'Sawing / Lasering'),
        ('BRUTING', 'Bruting'),
        ('POLISHING', 'Polishing'),
        ('QC', 'Quality Control'),
        ('COMPLETED', 'Completed'),
    )
    
    parcel = models.ForeignKey(RoughParcel, on_delete=models.CASCADE, related_name='production_jobs')
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='MARKING')
    assigned_worker = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='production_jobs')
    assigned_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=(('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('DONE', 'Done')), default='PENDING')
    rework_required = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.parcel.parcel_name} - {self.stage} ({self.status})"

class YieldReport(models.Model):
    parcel = models.OneToOneField(RoughParcel, on_delete=models.CASCADE, related_name='yield_report')
    final_polished_carats = models.DecimalField(max_digits=10, decimal_places=3)
    breakage_carats = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    wastage_carats = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    yield_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        from decimal import Decimal
        if self.parcel and self.parcel.carat_weight and self.final_polished_carats:
            polished = Decimal(str(self.final_polished_carats))
            rough = Decimal(str(self.parcel.carat_weight))
            self.yield_percentage = (polished / rough) * Decimal('100')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Yield for {self.parcel.parcel_name}: {self.yield_percentage}%"

class PolishedStone(models.Model):
    STATUS_CHOICES = (
        ('READY', 'Ready to Sell'),
        ('SOLD', 'Sold'),
        ('IN_TRANSIT', 'In Transit'),
    )
    
    source_parcel = models.ForeignKey(RoughParcel, on_delete=models.SET_NULL, null=True, related_name='polished_stones')
    stone_id = models.CharField(max_length=100, unique=True)
    carat_weight = models.DecimalField(max_digits=10, decimal_places=3)
    cut_grade = models.CharField(max_length=50, blank=True, null=True)
    color_grade = models.CharField(max_length=50, blank=True, null=True)
    clarity_grade = models.CharField(max_length=50, blank=True, null=True)
    certification_number = models.CharField(max_length=100, blank=True, null=True)
    certification_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='READY')
    price_estimate = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stone_id} ({self.carat_weight} ct)"
