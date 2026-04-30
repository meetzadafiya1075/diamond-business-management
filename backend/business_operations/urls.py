from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrokerViewSet, BuyerViewSet, InquiryViewSet, 
    QuotationViewSet, TransactionViewSet, ExpenseViewSet, DocumentViewSet,
    AnalyticsView, AlertsView
)

router = DefaultRouter()
router.register(r'brokers', BrokerViewSet)
router.register(r'buyers', BuyerViewSet)
router.register(r'inquiries', InquiryViewSet)
router.register(r'quotations', QuotationViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'documents', DocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/analytics/', AnalyticsView.as_view(), name='dashboard-analytics'),
    path('dashboard/alerts/', AlertsView.as_view(), name='dashboard-alerts'),
]
