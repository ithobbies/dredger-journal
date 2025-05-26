# apps/repairs/models.py
from django.db import models
from apps.core.models import AuditMixin
from apps.refdata.models import DredgerType, SparePart
from django.conf import settings
from django.core.exceptions import ValidationError

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

    def update_hours(self, new_hours: int, repair: 'Repair' = None) -> None:
        """Обновляет наработку компонента и создает запись в истории"""
        if new_hours < self.total_hours:
            raise ValueError("New hours cannot be less than current total hours")
        
        hours_delta = new_hours - self.total_hours
        self.total_hours = new_hours
        self.save()
        
        if repair:
            ComponentHistory.objects.create(
                component=self,
                repair=repair,
                hours_delta=hours_delta,
                total_hours=new_hours
            )

    def __str__(self):
        where = self.current_dredger.inv_number if self.current_dredger else "склад/снят"
        return f"{self.part.name} SN:{self.serial_number or '—'} [{where}]"


class ComponentHistory(models.Model):
    """История изменений наработки компонента"""
    component = models.ForeignKey(ComponentInstance, on_delete=models.CASCADE, related_name='history')
    repair = models.ForeignKey('Repair', on_delete=models.CASCADE, null=True, blank=True)
    hours_delta = models.IntegerField()
    total_hours = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Component histories"


class Repair(AuditMixin):
    dredger = models.ForeignKey(Dredger, on_delete=models.CASCADE, related_name="repairs")
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True)

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({
                'end_date': 'End date must be after start date'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ремонт {self.dredger.inv_number} ({self.start_date} → {self.end_date})"


class RepairItem(models.Model):
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name="items")
    component = models.ForeignKey(ComponentInstance, on_delete=models.PROTECT)
    hours = models.PositiveIntegerField()
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.component.part.name} · {self.hours} ч"
