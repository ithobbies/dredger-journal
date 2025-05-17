from collections import OrderedDict, Counter
from datetime import date

from django.http import HttpResponse
from django.db import models
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import io, pandas as pd

from apps.repairs.models import Repair, ComponentInstance
from apps.deviations.models import Deviation


# ────────────────────── вспом. функция ──────────────────────
def queryset_to_excel(qs, columns: OrderedDict[str, str], file_name: str) -> HttpResponse:
    """Преобразует QuerySet в .xlsx и отдаёт как attachment"""
    df = pd.DataFrame(list(qs.values(*columns.keys())))
    df.rename(columns=columns, inplace=True)

    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    buf.seek(0)

    resp = HttpResponse(
        buf,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    resp["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return resp


# ────────────────────── 1) Excel-экспорт ремонтов ──────────────────────
class RepairsExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Repair.objects.select_related("dredger").order_by("start_date")
        cols = OrderedDict([
            ("id",                   "ID"),
            ("dredger__inv_number",  "Землесос"),
            ("start_date",           "Начало"),
            ("end_date",             "Окончание"),
            ("notes",                "Примечание"),
            ("created_by__username", "Автор"),
        ])
        return queryset_to_excel(qs, cols, "repairs.xlsx")


# ────────────────────── 2) Excel-экспорт отклонений ──────────────────────
class DeviationsExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Deviation.objects.select_related("dredger").order_by("date")
        cols = OrderedDict([
            ("id",                  "ID"),
            ("date",                "Дата"),
            ("dredger__inv_number", "Землесос"),
            ("type",                "Вид простоя"),
            ("location",            "Участок"),
            ("description",         "Описание"),
            ("hours_at_deviation",  "Наработка, ч"),
        ])
        return queryset_to_excel(qs, cols, "deviations.xlsx")


# ────────────────────── 3) Данные для Dashboard ──────────────────────
class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- 3-A. Простои по видам ---
        date_after  = request.GET.get("date_after", str(date.today().replace(day=1)))
        date_before = request.GET.get("date_before", str(date.today()))
        qs = Deviation.objects.filter(date__range=[date_after, date_before])
        counts = Counter(qs.values_list("type", flat=True))
        downtime = [
            {"type": "mechanical",    "count": counts.get("mechanical",    0)},
            {"type": "electrical",    "count": counts.get("electrical",    0)},
            {"type": "technological", "count": counts.get("technological", 0)},
        ]

        # --- 3-B. Топ-5 агрегатов с минимальным ресурсом ---
        worn = (ComponentInstance.objects
                .select_related("part", "current_dredger")
                .exclude(part__norm_hours=0)
                .annotate(pct=models.F("total_hours") * 100.0 / models.F("part__norm_hours"))
                .order_by("-pct")[:5])
        wear_top = [{
            "dredger": w.current_dredger.inv_number if w.current_dredger else "—",
            "part":    w.part.name,
            "pct":     round(w.pct, 1),
        } for w in worn]

        return Response({"downtime": downtime, "wear_top": wear_top})
