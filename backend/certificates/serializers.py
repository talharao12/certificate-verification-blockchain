from rest_framework import serializers
from .models import Institution, Certificate

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'address', 'email', 'website', 'created_at']

class CertificateSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_address = serializers.CharField(source='institution.address', read_only=True)
    blockchain_tx = serializers.CharField(read_only=True)
    certificate_id = serializers.CharField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'institution', 'institution_name', 'institution_address',
            'student_name', 'student_id', 'student_email', 'course',
            'grade', 'issue_date', 'expiry_date', 'certificate_id',
            'blockchain_tx', 'status', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def validate_metadata(self, value):
        """Ensure metadata is a valid JSON object."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Metadata must be a valid JSON object")
        return value

class CertificateVerificationSerializer(serializers.Serializer):
    certificate_id = serializers.CharField(required=True)

class CertificateIssuanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = [
            'institution', 'student_name', 'student_id', 'student_email',
            'course', 'grade', 'issue_date', 'expiry_date', 'metadata'
        ]

    def create(self, validated_data):
        # Generate certificate hash
        instance = Certificate(**validated_data)
        instance.certificate_id = instance.generate_certificate_hash()
        return instance
