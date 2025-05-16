# apps/deviations/models.py
from django.db import models
from apps.core.models import AuditMixin
from apps.repairs.models import Dredger


class Deviation(AuditMixin):
    MECH = "mechanical"
    ELEC = "electrical"
    TECH = "technological"
    TYPE_CHOICES = [
        (MECH, "механический"),
        (ELEC, "электрический"),
        (TECH, "технологический"),
    ]

    PNS = "ПНС"
    TVS = "ТВС"
    SHX = "ШХ"
    LOC_CHOICES = [(PNS, "ПНС"), (TVS, "ТВС"), (SHX, "ШХ")]

    dredger = models.ForeignKey(Dredger, on_delete=models.CASCADE, related_name="deviations")
    date = models.DateField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    location = models.CharField(max_length=10, choices=LOC_CHOICES)
    last_ppr_date = models.DateField()
    hours_at_deviation = models.PositiveIntegerField()
    description = models.TextField()
    shift_leader = models.CharField(max_length=120)
    mechanic = models.CharField(max_length=120)
    electrician = models.CharField(max_length=120)

    def __str__(self):
        return f"{self.get_type_display()} простой {self.dredger.inv_number} · {self.date}"
