from rest_framework.permissions import BasePermission, SAFE_METHODS

def _has_group(user, group_name):
    return user and user.groups.filter(name=group_name).exists()

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_group(request.user, "Администратор")

class IsEngineerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_group(request.user, "Инженер") or _has_group(request.user, "Администратор")

class ReadOnlyOrOperatorEngineer(BasePermission):
    """
    • SAFE_METHODS (GET/HEAD/OPTIONS) — все аутентифицированные  
    • POST — Оператор или Инженер  
    • PUT/PATCH/DELETE — только Инженер или Администратор
    """
    def has_permission(self, request, view):
        user = request.user
        if request.method in SAFE_METHODS:
            return user.is_authenticated
        if request.method == "POST":
            return _has_group(user, "Оператор") or _has_group(user, "Инженер")
        # edit/delete
        return _has_group(user, "Инженер") or _has_group(user, "Администратор")

class ReadOnlyOrEngineerAdmin(BasePermission):
    """
    • SAFE_METHODS — все аутентифицированные
    • Любые изменяющие запросы — только Инженер или Администратор
    """
    def has_permission(self, request, view):
        user = request.user
        if request.method in SAFE_METHODS:
            return user.is_authenticated
        return _has_group(user, "Инженер") or _has_group(user, "Администратор")
