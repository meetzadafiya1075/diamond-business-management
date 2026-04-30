from rest_framework import serializers
from .models import Broker, Buyer, Inquiry, Quotation, Transaction, Expense, Document

class BrokerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Broker
        fields = '__all__'

class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'

class InquirySerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.company_name', read_only=True)
    class Meta:
        model = Inquiry
        fields = '__all__'

class QuotationSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.company_name', read_only=True)
    stone_id = serializers.CharField(source='stone.stone_id', read_only=True)
    class Meta:
        model = Quotation
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
