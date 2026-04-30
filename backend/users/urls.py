from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SignupView, ActivityLogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'logs', ActivityLogViewSet, basename='log')

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('', include(router.urls)),
]
