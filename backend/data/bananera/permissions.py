"""
Permisos personalizados para el sistema bananera
"""

from rest_framework import permissions
from .choices import RolUsuario


class IsAdministrador(permissions.BasePermission):
    """Permiso solo para administradores"""
    
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'rol'):
            return False
        return request.user.rol == RolUsuario.ADMINISTRADOR


class IsGerenteOrAdmin(permissions.BasePermission):
    """Permiso para gerentes y administradores"""
    
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'rol'):
            return False
        return request.user.rol in [RolUsuario.ADMINISTRADOR, RolUsuario.GERENTE]


class IsSupervisorOrAbove(permissions.BasePermission):
    """Permiso para supervisores, gerentes y administradores"""
    
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'rol'):
            return False
        return request.user.rol in [
            RolUsuario.ADMINISTRADOR,
            RolUsuario.GERENTE,
            RolUsuario.SUPERVISOR_FINCA
        ]


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permiso para que solo el dueño pueda editar"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.created_by == request.user if hasattr(obj, 'created_by') else False






