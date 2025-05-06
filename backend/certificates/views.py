from rest_framework import viewsets, status, response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated, IsInstitutionUser]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated, IsInstitutionUser]
    multichain = MultichainClient()

    def get_serializer_class(self):
        if self.action == 'create':
            return CertificateIssuanceSerializer
        if self.action == 'verify':
            return CertificateVerificationSerializer
        return CertificateSerializer

    def get_permissions(self):
        if self.action == 'verify':
            self.permission_classes = [IsAuthenticated, CanVerifyCertificate]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsInstitutionUser]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create certificate instance
        certificate = serializer.save(status='DRAFT')
        
        # Get blockchain data
        cert_data = certificate.get_blockchain_data()
        
        # Store on blockchain
        try:
            tx = self.multichain.publish_certificate(
                'certificates',
                certificate.certificate_id,
                cert_data
            )
            if 'error' in tx:
                certificate.delete()  # Rollback if blockchain fails
                return Response(
                    {'error': 'Blockchain transaction failed'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            # Update certificate with blockchain transaction
            certificate.blockchain_tx = tx['result']
            certificate.status = 'ISSUED'
            certificate.save()
            
            return Response(
                CertificateSerializer(certificate).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            certificate.delete()  # Rollback if blockchain fails
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cert_id = serializer.validated_data['certificate_id']
        
        try:
            certificate = Certificate.objects.get(certificate_id=cert_id)
            
            # Check if certificate is expired
            if certificate.expiry_date and certificate.expiry_date < timezone.now().date():
                return Response({
                    'is_valid': False,
                    'error': 'Certificate has expired'
                })
            
            # Check if certificate is revoked
            if certificate.status == 'REVOKED':
                return Response({
                    'is_valid': False,
                    'error': 'Certificate has been revoked'
                })
            
            # Verify on blockchain
            blockchain_data = self.multichain.get_certificate(
                'certificates',
                cert_id
            )
            
            if blockchain_data:
                # Verify certificate hash
                stored_hash = blockchain_data.get('certificate_id')
                computed_hash = certificate.generate_certificate_hash()
                
                if stored_hash == computed_hash:
                    return Response({
                        'is_valid': True,
                        'certificate': CertificateSerializer(certificate).data,
                        'blockchain_data': blockchain_data
                    })
            
            return Response({
                'is_valid': False,
                'error': 'Certificate verification failed'
            })
                
        except Certificate.DoesNotExist:
            return Response(
                {'error': 'Certificate not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def revoke(self, request, pk=None):
        certificate = self.get_object()
        
        if certificate.status == 'REVOKED':
            return Response({
                'error': 'Certificate is already revoked'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update blockchain
            cert_data = certificate.get_blockchain_data()
            cert_data['status'] = 'REVOKED'
            cert_data['revoked_at'] = timezone.now().isoformat()
            cert_data['revoked_by'] = request.user.username
            
            tx = self.multichain.publish_certificate(
                'certificates',
                certificate.certificate_id,
                cert_data
            )
            
            if 'error' in tx:
                return Response(
                    {'error': 'Failed to revoke certificate on blockchain'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Update database
            certificate.status = 'REVOKED'
            certificate.metadata['revoked_at'] = timezone.now().isoformat()
            certificate.metadata['revoked_by'] = request.user.username
            certificate.save()
            
            return Response(CertificateSerializer(certificate).data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
