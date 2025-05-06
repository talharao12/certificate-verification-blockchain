from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import InstitutionViewSet, CertificateViewSet
from .auth_views import (
    EmployerRegistrationView, InstitutionRegistrationView,
    LoginView, UserProfileView
)

router = DefaultRouter(trailing_slash=False)
router.register(r'institutions', InstitutionViewSet)
router.register(r'certificates', CertificateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/register/employer/', EmployerRegistrationView.as_view(), name='employer-register'),
    path('auth/register/institution/', InstitutionRegistrationView.as_view(), name='institution-register'),
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
]
