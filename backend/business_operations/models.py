from django.db import models
from core_operations.models import PolishedStone
from users.models import User

# --- Sales CRM Models ---

class Broker(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Commission percentage")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Buyer(models.Model):
    company_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    kyc_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

class Inquiry(models.Model):
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, related_name='inquiries')
    requirements = models.TextField(help_text="Details of what the buyer is looking for (e.g. 1ct, D, VVS1)")
    status = models.CharField(max_length=50, choices=(('OPEN', 'Open'), ('CLOSED', 'Closed')), default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry by {self.buyer.company_name}"

class Quotation(models.Model):
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, related_name='quotations')
    broker = models.ForeignKey(Broker, on_delete=models.SET_NULL, null=True, blank=True)
    stone = models.ForeignKey(PolishedStone, on_delete=models.CASCADE)
    proposed_price = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=(('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected')), default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quote to {self.buyer.company_name} for {self.stone.stone_id}"

# --- Accounts Models ---

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('PAYABLE', 'Payable'),
        ('RECEIVABLE', 'Receivable'),
    )
    transaction_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    party_name = models.CharField(max_length=255, help_text="Supplier or Buyer Name")
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=50, choices=(('OUTSTANDING', 'Outstanding'), ('CLEARED', 'Cleared')), default='OUTSTANDING')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.party_name} - ${self.amount}"

class Expense(models.Model):
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.category} - ${self.amount}"

# --- Document Models ---

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=50, choices=(('INVOICE', 'Invoice'), ('CERTIFICATE', 'Certificate'), ('KYC', 'KYC'), ('OTHER', 'Other')))
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
