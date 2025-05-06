from rest_framework import viewsets, status, response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Institution, Certificate
from .serializers import (
    InstitutionSerializer,
    CertificateSerializer,
    CertificateVerificationSerializer,
    CertificateIssuanceSerializer
)
from .auth_serializers import UserSerializer
from .jwt_serializers import EmailTokenObtainPairSerializer
from .permissions import IsInstitutionUser, IsEmployerUser, CanVerifyCertificate
from .multichain_utils import MultichainClient
import hashlib
import json
from django.utils import timezone
import requests

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [AllowAny]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [AllowAny]
    multichain = MultichainClient()

    def get_serializer_class(self):
        if self.action == 'create':
            return CertificateIssuanceSerializer
        if self.action == 'verify':
            return CertificateVerificationSerializer
        return CertificateSerializer

    def get_permissions(self):
        if self.action == 'verify':
            self.permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def verify(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        certificate_id = serializer.validated_data['certificate_id']

        try:
            certificate = Certificate.objects.get(certificate_id=certificate_id)
            is_valid = True
            message = "Certificate is valid"
        except Certificate.DoesNotExist:
            is_valid = False
            message = "Certificate not found"

        return Response({
            'is_valid': is_valid,
            'message': message,
            'certificate': CertificateSerializer(certificate).data if is_valid else None
        })

    @action(detail=False, methods=['get'])
    def list_all_blockchain(self, request):
        try:
            # Get all certificates from blockchain
            certificates = self.multichain.list_certificates()
            return Response(certificates)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create certificate in database with ISSUED status
        certificate = serializer.save(status='ISSUED')

        # Add to blockchain
        try:
            self.multichain.add_certificate(certificate)
        except Exception as e:
            # If blockchain addition fails, delete the database entry
            certificate.delete()
            return Response(
                {'error': f'Failed to add certificate to blockchain: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            CertificateSerializer(certificate).data,
            status=status.HTTP_201_CREATED
        )
