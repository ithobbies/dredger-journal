"""
apps/core/permissions.py  –  итоговый файл

Определяет разрешения, используемые во ViewSet’ах проекта «Dredger Journal».

Группы (русские названия):
    • «Оператор»
    • «Инженер»
    • «Администратор»
"""

from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission, SAFE_METHODS

# ────────────────────── константы групп ──────────────────────
OPERATOR      = "Оператор"
ENGINEER      = "Инженер"
ADMINISTRATOR = "Администратор"


def _in_group(user: User, group_name: str) -> bool:
    """Проверяем, состоит ли пользователь в указанной группе."""
    return user.groups.filter(name=group_name).exists()


# ────────────────────── базовое разрешение ──────────────────────
class ReadOnlyOrOperatorEngineer(BasePermission):
    """
    • GET/HEAD/OPTIONS доступны любому аутентифицированному.
    • POST/PUT/PATCH/DELETE разрешены операторам, инженерам и администраторам.
    • superuser или staff-пользователь имеет доступ ко всему.
    """

    def has_permission(self, request, view):
        user = request.user

        # Суперпользователь или staff – полный доступ
        if user and (user.is_superuser or user.is_staff):
            return True

        # Безопасные методы – любое аутентифицированное лицо
        if request.method in SAFE_METHODS:
            return bool(user and user.is_authenticated)

        # Модифицирующие запросы
        return (
            _in_group(user, OPERATOR)      or
            _in_group(user, ENGINEER)      or
            _in_group(user, ADMINISTRATOR)
        )


class IsEngineerOrAdmin(BasePermission):
    """
    Разрешает любые операции пользователям из групп
    «Инженер» или «Администратор», а также superuser/staff.
    Остальным возвращает 403.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Полный доступ для staff / superuser
        if user.is_staff or user.is_superuser:
            return True

        # Инженер или Администратор
        return (
            _in_group(user, ENGINEER) or
            _in_group(user, ADMINISTRATOR)
        )


# ────────────────────── алиас для обратной совместимости ──────────────────────
# Старое имя использовалось в некоторых view-файлах.
ReadOnlyOrEngineerAdmin = IsEngineerOrAdmin
