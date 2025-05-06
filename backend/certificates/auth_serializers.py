from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Institution

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'user_type']
        extra_kwargs = {
            'user_type': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class InstitutionRegistrationSerializer(UserRegistrationSerializer):
    institution_name = serializers.CharField(required=True)
    institution_address = serializers.CharField(required=True)
    institution_website = serializers.URLField(required=False)

    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields + [
            'institution_name', 'institution_address', 'institution_website'
        ]

    def create(self, validated_data):
        institution_data = {
            'name': validated_data.pop('institution_name'),
            'address': validated_data.pop('institution_address'),
            'website': validated_data.pop('institution_website', None),
            'email': validated_data['email']
        }
        
        # Force user type to be INSTITUTION
        validated_data['user_type'] = 'INSTITUTION'
        
        # Create user first
        user = super().create(validated_data)
        
        # Create institution and link it to user
        institution = Institution.objects.create(**institution_data)
        user.institution = institution
        user.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type']
        read_only_fields = ['user_type']
