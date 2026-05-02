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
        
        # 2. Check if user is a superuser (fail-safe)
        if request.user.is_superuser:
            return True

        # 3. Check if user has an allowed role
        user_role = getattr(request.user, 'role', '')
        if user_role and user_role.upper() in [role.upper() for role in self.allowed_roles]:
            return True

        # 4. All authenticated users can view (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # 5. Otherwise, deny access
        return False

class IsAdminRole(BaseRolePermission):
    allowed_roles = ['ADMIN']
    
    def has_permission(self, request, view):
        # 1. First check the base role/superuser logic
        if super().has_permission(request, view):
            return True
            
        # 2. Backup: Check Django's built-in is_staff flag
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.is_superuser or 
            getattr(request.user, 'role', '').upper() == 'ADMIN'
        ))

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
