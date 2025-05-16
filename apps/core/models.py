# apps/core/models.py
from django.db import models
from django.conf import settings

class AuditMixin(models.Model):
    """Абстрактный класс – добавляет поля аудита ко всем наследникам."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_updated",
    )

    class Meta:
        abstract = True
        ordering = ("-created_at",)
