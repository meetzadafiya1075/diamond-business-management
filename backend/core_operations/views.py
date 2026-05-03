from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import (
    Supplier, RoughParcel, ParcelTracking, 
    PlanningRecord, ProductionJob, YieldReport, PolishedStone
)
from .serializers import (
    SupplierSerializer, RoughParcelSerializer, 
    ParcelTrackingSerializer, PlanningRecordSerializer, 
    ProductionJobSerializer, YieldReportSerializer, PolishedStoneSerializer
)
from users.permissions import (
    IsPlannerOrAdmin, IsWorkerOrAdmin, IsAccountantOrAdmin, IsSalesOrAdmin, IsProductionTeam
)

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsPlannerOrAdmin]

class RoughParcelViewSet(viewsets.ModelViewSet):
    queryset = RoughParcel.objects.all()
    serializer_class = RoughParcelSerializer
    permission_classes = [IsWorkerOrAdmin]

    def perform_create(self, serializer):
        parcel = serializer.save()
        # Automatically create the tracking record for the new parcel
        ParcelTracking.objects.create(parcel=parcel, status='IN_INVENTORY')
        # Record Activity Log safely
        try:
            from users.models import ActivityLog
            ActivityLog.objects.create(
                user=self.request.user,
                action="PARCEL_CREATED",
                details=f"Created rough parcel: {parcel.parcel_name} ({parcel.carat_weight} ct)"
            )
        except Exception as e:
            print(f"Logging failed: {e}")

class ParcelTrackingViewSet(viewsets.ModelViewSet):
    queryset = ParcelTracking.objects.all()
    serializer_class = ParcelTrackingSerializer
    permission_classes = [IsWorkerOrAdmin]

class PlanningRecordViewSet(viewsets.ModelViewSet):
    queryset = PlanningRecord.objects.all()
    serializer_class = PlanningRecordSerializer
    permission_classes = [IsPlannerOrAdmin]

    def perform_create(self, serializer):
        plan = serializer.save()
        # Update tracking status
        tracking, created = ParcelTracking.objects.get_or_create(parcel=plan.parcel)
        tracking.status = 'IN_PLANNING'
        tracking.save()

class ProductionJobViewSet(viewsets.ModelViewSet):
    queryset = ProductionJob.objects.all()
    serializer_class = ProductionJobSerializer
    permission_classes = [IsProductionTeam]

class YieldReportViewSet(viewsets.ModelViewSet):
    queryset = YieldReport.objects.all()
    serializer_class = YieldReportSerializer
    permission_classes = [IsAccountantOrAdmin]

class PolishedStoneViewSet(viewsets.ModelViewSet):
    queryset = PolishedStone.objects.all()
    serializer_class = PolishedStoneSerializer
    permission_classes = [IsPlannerOrAdmin]
