from rest_framework import permissions

class BaseRolePermission(permissions.BasePermission):
    """
    Base permission that allows safe methods for any authenticated user,
    and checks for specific roles for other methods.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admin always has full access
        if request.user.role == 'ADMIN':
            return True
            
        # All authenticated users can view
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check specific roles for mutations
        return request.user.role in self.allowed_roles

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsPlannerOrAdmin(BaseRolePermission):
    allowed_roles = ['PLANNER']

class IsWorkerOrAdmin(BaseRolePermission):
    allowed_roles = ['WORKER']

class IsOfficeOrAdmin(BaseRolePermission):
    allowed_roles = ['OFFICE']

class IsSalesOrAdmin(BaseRolePermission):
    allowed_roles = ['SALES']

class IsAccountantOrAdmin(BaseRolePermission):
    allowed_roles = ['ACCOUNTANT']
