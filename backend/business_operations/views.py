from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Broker, Buyer, Inquiry, Quotation, Transaction, Expense, Document
from .serializers import (
    BrokerSerializer, BuyerSerializer, InquirySerializer, 
    QuotationSerializer, TransactionSerializer, ExpenseSerializer, DocumentSerializer
)

from users.permissions import IsAdminRole

class BrokerViewSet(viewsets.ModelViewSet):
    queryset = Broker.objects.all()
    serializer_class = BrokerSerializer
    permission_classes = [IsAuthenticated]

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdminRole()]
        return [IsAuthenticated()]

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdminRole()]
        return [IsAuthenticated()]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

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
