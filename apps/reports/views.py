from collections import OrderedDict, Counter
from datetime import date, timedelta
import io
import pandas as pd

from django.db import models
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.repairs.models import (
    Repair,
    RepairItem,
    ComponentInstance,
    Dredger,
)
from apps.deviations.models import Deviation

# ───────────────────────── helper: queryset → .xlsx ─────────────────────────
def queryset_to_excel(qs, columns: OrderedDict[str, str], file_name: str) -> HttpResponse:
    """Преобразует QuerySet в Excel-файл и возвращает его как attachment."""
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

# ───────────────────────── 1. Excel-экспорт ремонтов ─────────────────────────
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

# ──────────────────────── 2. Excel-экспорт отклонений ────────────────────────
class DeviationsExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Deviation.objects.select_related("dredger").order_by("date")
        cols = OrderedDict([
            ("id",                  "ID"),
            ("date",                "Дата"),
            ("dredger__inv_number", "Землесос"),
            ("type",                "Вид"),
            ("location",            "Участок"),
            ("description",         "Описание"),
            ("hours_at_deviation",  "Наработка, ч"),
        ])
        return queryset_to_excel(qs, cols, "deviations.xlsx")

# ───────────────────────────── 3. Dashboard data ─────────────────────────────
class DashboardDataView(APIView):
    """Возвращает сводку для главного дашборда."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 3-A. распределение простоев по видам (за заданный период или с начала месяца по сегодня)
        date_after  = request.GET.get("date_after",  str(date.today().replace(day=1)))
        date_before = request.GET.get("date_before", str(date.today()))
        qs = Deviation.objects.filter(date__range=[date_after, date_before])
        counts = Counter(qs.values_list("type", flat=True))
        downtime = [
            {"type": "mechanical",    "count": counts.get("mechanical",    0)},
            {"type": "electrical",    "count": counts.get("electrical",    0)},
            {"type": "technological", "count": counts.get("technological", 0)},
        ]

        # 3-B. топ-5 самых изношенных агрегатов
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

        # 3-C. остаточный ресурс по каждому землесосу (процент оставшегося ресурса у наиболее изношенного узла)
        dredger_resources = []
        for d in Dredger.objects.all():
            comps = (ComponentInstance.objects
                     .filter(current_dredger=d, part__norm_hours__gt=0)
                     .annotate(pct=models.F("total_hours") * 100.0 / models.F("part__norm_hours")))
            if comps:
                max_pct = max(c.pct for c in comps)      # максимальный % износа
                dredger_resources.append({
                    "id": d.id,
                    "inv_number": d.inv_number,
                    "remain_pct": round(100 - max_pct, 1),
                })

        # 3-D. землесосы в ремонте (состоянием на сегодня)
        today = date.today()
        in_progress = (Repair.objects
                       .filter(start_date__lte=today, end_date__gte=today)
                       .select_related("dredger")
                       .values("id", "dredger__inv_number", "end_date"))

        # 3-E. отклонения за последние 24 ч
        since = today - timedelta(days=1)
        deviations_24h = (Deviation.objects
                          .filter(date__gte=since)
                          .select_related("dredger")
                          .values("id", "date", "type", "dredger__inv_number", "description")[:50])

        return Response({
            "downtime":            downtime,
            "wear_top":            wear_top,
            "dredger_resources":   dredger_resources,
            "repairs_in_progress": list(in_progress),
            "deviations_24h":      list(deviations_24h),
        })
