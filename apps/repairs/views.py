from collections import Counter
from django_filters.rest_framework import FilterSet, DateFilter, CharFilter
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.permissions import (
    IsEngineerOrAdmin, ReadOnlyOrOperatorEngineer, ReadOnlyOrEngineerAdmin
)
from apps.repairs.models import RepairItem
from apps.refdata.models import DredgerTypePart, SparePart
from .models import Dredger, ComponentInstance, Repair
from .serializers import (
    DredgerSerializer, ComponentInstanceSerializer, ComponentInstanceWriteSerializer,
    RepairSerializer,
)
from django.db.models import Q

# Фильтр для ремонта: интерпретируем start_date/end_date как границы интервала
class RepairFilter(FilterSet):
    start_date = DateFilter(field_name="start_date", lookup_expr="gte")
    end_date = DateFilter(field_name="end_date", lookup_expr="lte")
    status = CharFilter(method="status_filter")

    def status_filter(self, queryset, name, value):
        from datetime import date
        today = date.today()
        if value == "planned":
            return queryset.filter(start_date__gt=today)
        elif value == "completed":
            return queryset.filter(end_date__lt=today, end_date__isnull=False)
        elif value == "in_progress":
            return queryset.filter(start_date__lte=today).filter(Q(end_date__gte=today) | Q(end_date__isnull=True))
        return queryset

    class Meta:
        model = Repair
        fields = ["dredger", "start_date", "end_date", "status"]


class AvailableComponentsView(APIView):
    """API для получения доступных компонентов для замены"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        part_ids = request.query_params.get('part_ids', '').split(',')
        if not part_ids or not part_ids[0]:
            return Response([])

        # Получаем компоненты, которые:
        # 1. Соответствуют запрошенным типам запчастей
        # 2. Не установлены на землесосы (current_dredger is null)
        # 3. Имеют наработку меньше нормы
        components = ComponentInstance.objects.filter(
            part_id__in=part_ids,
            current_dredger__isnull=True
        ).select_related('part')

        # Фильтруем по наработке
        available = []
        for comp in components:
            if comp.total_hours < comp.part.norm_hours:
                available.append({
                    'id': comp.id,
                    'part_id': comp.part_id,
                    'serial_number': comp.serial_number,
                    'total_hours': comp.total_hours,
                    'norm_hours': comp.part.norm_hours
                })

        return Response(available)


# — Dredgers —
class DredgerViewSet(viewsets.ModelViewSet):
    queryset = Dredger.objects.select_related("type")
    serializer_class = DredgerSerializer
    permission_classes = [ReadOnlyOrEngineerAdmin]
    search_fields = ("inv_number",)
    filterset_fields = ("type",)
    ordering_fields = ("inv_number",)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def template(self, request, pk=None):
        dredger = self.get_object()
        # Список необходимых запчастей по типу землесоса
        parts = (SparePart.objects
                 .filter(id__in=DredgerTypePart.objects.filter(dredger_type=dredger.type)
                         .values_list("part_id", flat=True))
                 .order_by("name"))
        # Загружаем все текущие компоненты землесоса одним запросом
        comps = {comp.part_id: comp for comp in dredger.components.all()}
        data = []
        for part in parts:
            comp = comps.get(part.id)
            data.append({
                "part_id": part.id,
                "part_name": part.name,
                "manufacturer": part.manufacturer,
                "norm_hours": part.norm_hours,
                "component_id": comp.id if comp else None,
                "current_hours": comp.total_hours if comp else 0,
                "serial_number": comp.serial_number if comp else "",
            })
        return Response(data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def components(self, request, pk=None):
        comps = self.get_object().components.select_related("part")
        return Response(ComponentInstanceSerializer(comps, many=True).data)


# — Components —
class ComponentInstanceViewSet(viewsets.ModelViewSet):
    queryset = ComponentInstance.objects.select_related("part", "current_dredger")
    permission_classes = [IsEngineerOrAdmin]
    filterset_fields = ("part", "current_dredger")
    search_fields = ("serial_number", "part__name")
    ordering_fields = ("total_hours",)

    def get_serializer_class(self):
        # Используем упрощённый сериализатор для записи, и подробный с вложенным part для чтения
        if self.action in ["create", "update", "partial_update"]:
            return ComponentInstanceWriteSerializer
        return ComponentInstanceSerializer

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        comp = self.get_object()
        qs = (comp.repairitem_set
              .select_related("repair", "repair__dredger")
              .order_by("repair__start_date"))
        history = [{
            "repair_id": i.repair_id,
            "dredger":   i.repair.dredger.inv_number,
            "start_date": i.repair.start_date,
            "end_date":   i.repair.end_date,
            "hours":     i.hours,
            "note":      i.note,
        } for i in qs]
        return Response(history)


# — Repairs —
class RepairViewSet(viewsets.ModelViewSet):
    queryset = (Repair.objects
                .select_related("dredger")
                .prefetch_related("items"))
    serializer_class = RepairSerializer
    permission_classes = [ReadOnlyOrOperatorEngineer]
    filterset_class = RepairFilter
    search_fields = ("notes",)
    ordering_fields = ("start_date", "-start_date")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
