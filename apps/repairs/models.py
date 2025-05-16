# apps/repairs/models.py
from django.db import models
from apps.core.models import AuditMixin
from apps.refdata.models import DredgerType, SparePart
from django.conf import settings

class Dredger(models.Model):
    """Конкретная машина в парке"""
    inv_number = models.CharField("Хоз. номер", max_length=50, unique=True)
    type = models.ForeignKey(DredgerType, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.inv_number} ({self.type.code})"


class ComponentInstance(models.Model):
    """Физический экземпляр агрегата"""
    part = models.ForeignKey(SparePart, on_delete=models.PROTECT)
    serial_number = models.CharField(max_length=120, blank=True)
    current_dredger = models.ForeignKey(
        Dredger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="components",
    )
    total_hours = models.PositiveIntegerField(default=0)

    def __str__(self):
        where = self.current_dredger.inv_number if self.current_dredger else "склад/снят"
        return f"{self.part.name} SN:{self.serial_number or '—'} [{where}]"


class Repair(AuditMixin):
    dredger = models.ForeignKey(Dredger, on_delete=models.CASCADE, related_name="repairs")
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Ремонт {self.dredger.inv_number} ({self.start_date} → {self.end_date})"


class RepairItem(models.Model):
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name="items")
    component = models.ForeignKey(ComponentInstance, on_delete=models.PROTECT)
    hours = models.PositiveIntegerField()
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.component.part.name} · {self.hours} ч"
