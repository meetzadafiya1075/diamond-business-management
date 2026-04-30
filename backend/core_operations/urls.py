from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, RoughParcelViewSet, 
    ParcelTrackingViewSet, PlanningRecordViewSet, 
    ProductionJobViewSet, YieldReportViewSet, PolishedStoneViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'rough-parcels', RoughParcelViewSet)
router.register(r'parcel-tracking', ParcelTrackingViewSet)
router.register(r'planning-records', PlanningRecordViewSet)
router.register(r'production-jobs', ProductionJobViewSet)
router.register(r'yield-reports', YieldReportViewSet)
router.register(r'polished-stones', PolishedStoneViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
