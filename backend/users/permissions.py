from rest_framework import permissions

class BaseRolePermission(permissions.BasePermission):
    """
    Base permission that allows safe methods for any authenticated user,
    and checks for specific roles for other methods.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        # 1. Check if user is authenticated
        if not (request.user and request.user.is_authenticated):
            return False
        
        # 2. Admin always has full access to everything
        user_role = getattr(request.user, 'role', '') or ''
        if user_role.upper() == 'ADMIN':
            return True
            
        # 3. All authenticated users can view (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # 4. Check specific roles for writing/editing (POST, PUT, PATCH, DELETE)
        return user_role.upper() in [role.upper() for role in self.allowed_roles]

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
