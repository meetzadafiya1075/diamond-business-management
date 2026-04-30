from rest_framework import serializers
from .models import Supplier, RoughParcel, ParcelTracking, PlanningRecord, ProductionJob, YieldReport, PolishedStone

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ParcelTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParcelTracking
        fields = '__all__'

class PlanningRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanningRecord
        fields = '__all__'

class ProductionJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionJob
        fields = '__all__'

class RoughParcelSerializer(serializers.ModelSerializer):
    tracking = ParcelTrackingSerializer(read_only=True)
    planning = PlanningRecordSerializer(read_only=True)
    production_jobs = ProductionJobSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = RoughParcel
        fields = '__all__'

class YieldReportSerializer(serializers.ModelSerializer):
    parcel_name = serializers.CharField(source='parcel.parcel_name', read_only=True)
    
    class Meta:
        model = YieldReport
        fields = '__all__'

class PolishedStoneSerializer(serializers.ModelSerializer):
    source_parcel_name = serializers.CharField(source='source_parcel.parcel_name', read_only=True)
    
    class Meta:
        model = PolishedStone
        fields = '__all__'
