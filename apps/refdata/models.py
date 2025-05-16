# apps/refdata/models.py
from django.db import models

class DredgerType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class SparePart(models.Model):
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=120)
    manufacturer = models.CharField(max_length=120, blank=True)
    norm_hours = models.PositiveIntegerField(help_text="Допустимая наработка, ч")
    drawing_file = models.FileField(upload_to="drawings/", blank=True)

    def __str__(self):
        return f"{self.code} — {self.name}"


class DredgerTypePart(models.Model):
    """Какие запчасти входят в состав конкретного типа землесоса"""
    dredger_type = models.ForeignKey(DredgerType, on_delete=models.CASCADE)
    part = models.ForeignKey(SparePart, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("dredger_type", "part")

    def __str__(self):
        return f"{self.dredger_type} · {self.part}"
