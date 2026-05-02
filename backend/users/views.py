from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, ActivityLog
from .serializers import UserSerializer, SignupSerializer, ActivityLogSerializer
from .permissions import IsAdminRole

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminRole]

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # If there are no admins in the system yet, make this user an ADMIN
        if not User.objects.filter(role='ADMIN').exists():
            serializer.save(role='ADMIN', is_staff=True, is_superuser=True)
        else:
            serializer.save(role='WORKER')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            # Only Admins can manage users
            return [IsAdminRole()]
        # Authenticated users can see the list or their own 'me' data
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
