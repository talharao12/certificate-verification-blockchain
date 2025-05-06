from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import hashlib
import json

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'ADMIN')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    USER_TYPES = (
        ('ADMIN', 'Admin'),
        ('INSTITUTION', 'Institution'),
        ('EMPLOYER', 'Employer'),
    )

    username = None
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='EMPLOYER')
    institution = models.OneToOneField(
        'Institution',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='user'
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

class Institution(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    email = models.EmailField(default='admin@example.com')
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Certificate(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ISSUED', 'Issued'),
        ('REVOKED', 'Revoked')
    ]

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    student_name = models.CharField(max_length=255)
    student_id = models.CharField(max_length=50)
    student_email = models.EmailField(null=True, blank=True)
    course = models.CharField(max_length=255)
    grade = models.CharField(max_length=10, blank=True)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    certificate_id = models.CharField(max_length=64, unique=True)
    blockchain_tx = models.CharField(max_length=64)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_name} - {self.course}"

    def generate_certificate_hash(self):
        """Generate a unique hash for the certificate based on its contents."""
        cert_data = {
            'student_name': self.student_name,
            'student_id': self.student_id,
            'student_email': self.student_email,
            'course': self.course,
            'grade': self.grade,
            'issue_date': self.issue_date.isoformat(),
            'institution_id': self.institution.id,
            'institution_name': self.institution.name
        }
        return hashlib.sha256(
            json.dumps(cert_data, sort_keys=True).encode()
        ).hexdigest()

    def get_blockchain_data(self):
        """Get the certificate data to be stored on the blockchain."""
        return {
            'certificate_id': self.certificate_id,
            'student_name': self.student_name,
            'student_id': self.student_id,
            'student_email': self.student_email,
            'course': self.course,
            'grade': self.grade,
            'issue_date': self.issue_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'institution': {
                'id': self.institution.id,
                'name': self.institution.name,
                'address': self.institution.address
            },
            'status': self.status,
            'metadata': self.metadata
        }
