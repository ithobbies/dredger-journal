# apps/core/models.py
from django.db import models
from django.conf import settings

class AuditMixin(models.Model):
    """Абстрактный класс – добавляет поля аудита ко всем наследникам."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="%(class)s_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="%(class)s_updated",
    )

    class Meta:
        abstract = True
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        if not self.pk and not self.created_by_id:
            raise ValueError("created_by is required for new instances")
        if not self.updated_by_id:
            raise ValueError("updated_by is required")
        super().save(*args, **kwargs)
