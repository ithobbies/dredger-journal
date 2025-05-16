from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.core.permissions import IsEngineerOrAdmin
from apps.reports.excel import queryset_to_excel
from apps.repairs.models import Repair
from apps.deviations.models import Deviation
from collections import OrderedDict


class RepairsExcelView(APIView):
    permission_classes = [IsEngineerOrAdmin & IsAuthenticated]

    def get(self, request):
        qs = Repair.objects.select_related("dredger").order_by("start_date")

        # ➜ можно обработать query-params (дата-фильтр) — упрощённо опускаем
        cols = OrderedDict([
            ("id",       "ID"),
            ("dredger__inv_number", "Землесос"),
            ("start_date", "Начало"),
            ("end_date",   "Окончание"),
            ("notes",      "Примечание"),
            ("created_by__username", "Автор"),
        ])
        return queryset_to_excel(qs, cols, "repairs.xlsx")


class DeviationsExcelView(APIView):
    permission_classes = [IsEngineerOrAdmin & IsAuthenticated]

    def get(self, request):
        qs = Deviation.objects.select_related("dredger").order_by("date")
        cols = OrderedDict([
            ("id",       "ID"),
            ("date",     "Дата"),
            ("dredger__inv_number", "Землесос"),
            ("type",     "Вид простоя"),
            ("location", "Участок"),
            ("description", "Описание"),
            ("hours_at_deviation", "Наработка, ч"),
        ])
        return queryset_to_excel(qs, cols, "deviations.xlsx")
