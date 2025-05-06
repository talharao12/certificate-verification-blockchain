from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Institution, Certificate

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'is_staff', 'is_active')
    list_filter = ('user_type', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('user_type', 'institution', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'user_type', 'is_staff', 'is_active'),
        }),
    )

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'website', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'address')
    ordering = ('name',)
    date_hierarchy = 'created_at'

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_id', 'student_name', 'student_id', 'course', 'institution', 'status', 'issue_date')
    list_filter = ('status', 'issue_date', 'institution')
    search_fields = ('certificate_id', 'student_name', 'student_id', 'student_email', 'course')
    readonly_fields = ('certificate_id', 'blockchain_tx', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    date_hierarchy = 'issue_date'
    
    fieldsets = (
        ('Certificate Information', {
            'fields': ('certificate_id', 'status', 'institution')
        }),
        ('Student Information', {
            'fields': ('student_name', 'student_id', 'student_email')
        }),
        ('Course Details', {
            'fields': ('course', 'grade', 'issue_date', 'expiry_date')
        }),
        ('Blockchain Information', {
            'fields': ('blockchain_tx', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
