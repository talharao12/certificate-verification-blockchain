from rest_framework import permissions

class IsInstitutionUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'INSTITUTION'

    def has_object_permission(self, request, view, obj):
        return obj.institution == request.user.institution

class IsEmployerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'EMPLOYER'

class CanVerifyCertificate(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.user_type in ['EMPLOYER', 'INSTITUTION', 'ADMIN']
