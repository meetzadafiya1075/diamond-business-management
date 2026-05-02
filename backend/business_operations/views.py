from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Broker, Buyer, Inquiry, Quotation, Transaction, Expense, Document
from .serializers import (
    BrokerSerializer, BuyerSerializer, InquirySerializer, 
    QuotationSerializer, TransactionSerializer, ExpenseSerializer, DocumentSerializer
)

from users.permissions import (
    IsAdminRole, IsOfficeOrAdmin, IsSalesOrAdmin, IsAccountantOrAdmin
)

class BrokerViewSet(viewsets.ModelViewSet):
    queryset = Broker.objects.all()
    serializer_class = BrokerSerializer
    permission_classes = [IsOfficeOrAdmin]

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    permission_classes = [IsOfficeOrAdmin]

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [IsOfficeOrAdmin]

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    permission_classes = [IsSalesOrAdmin]

    def perform_create(self, serializer):
        quote = serializer.save()
        try:
            from users.models import ActivityLog
            ActivityLog.objects.create(
                user=self.request.user,
                action="QUOTATION_CREATED",
                details=f"Quoted ${quote.proposed_price} to {quote.buyer.company_name} for stone {quote.stone.stone_id}"
            )
        except Exception as e:
            print(f"Logging failed: {e}")

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAccountantOrAdmin]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAccountantOrAdmin]

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsOfficeOrAdmin]

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg
from core_operations.models import RoughParcel, PolishedStone, YieldReport
import datetime

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate basic financials
        total_receivables = Transaction.objects.filter(transaction_type='RECEIVABLE', status='OUTSTANDING').aggregate(Sum('amount'))['amount__sum'] or 0
        total_payables = Transaction.objects.filter(transaction_type='PAYABLE', status='OUTSTANDING').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Calculate Yield metrics
        avg_yield = YieldReport.objects.aggregate(Avg('yield_percentage'))['yield_percentage__avg'] or 0
        
        # Calculate inventory value
        polished_value = PolishedStone.objects.filter(status='READY').aggregate(Sum('price_estimate'))['price_estimate__sum'] or 0
        
        return Response({
            'total_receivables': total_receivables,
            'total_payables': total_payables,
            'net_position': total_receivables - total_payables,
            'average_yield': round(avg_yield, 2),
            'polished_inventory_value': polished_value,
        })

class AlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alerts = []
        
        # Check overdue transactions
        today = datetime.date.today()
        overdue_tx = Transaction.objects.filter(status='OUTSTANDING', due_date__lt=today)
        for tx in overdue_tx:
            alerts.append({
                'type': 'PAYMENT_OVERDUE',
                'message': f"Overdue {tx.transaction_type} for {tx.party_name} (${tx.amount})",
                'severity': 'HIGH'
            })
            
        return Response({'alerts': alerts})
