from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.permissions import (
    IsEngineerOrAdmin, ReadOnlyOrOperatorEngineer,
)
from apps.repairs.models import RepairItem
from apps.refdata.models import DredgerTypePart, SparePart
from .models import Dredger, ComponentInstance, Repair
from .serializers import (
    DredgerSerializer, ComponentInstanceSerializer, RepairSerializer,
)

# — Dredgers —
class DredgerViewSet(viewsets.ModelViewSet):
    queryset = Dredger.objects.select_related("type")
    serializer_class = DredgerSerializer
    permission_classes = [IsEngineerOrAdmin]
    search_fields = ("inv_number",)
    filterset_fields = ("type",)
    ordering_fields = ("inv_number",)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def template(self, request, pk=None):
        dredger = self.get_object()
        parts = (
            SparePart.objects
            .filter(id__in=DredgerTypePart.objects
                    .filter(dredger_type=dredger.type)
                    .values_list("part_id", flat=True))
            .order_by("name")
        )
        data = []
        for part in parts:
            comp = dredger.components.filter(part=part).first()
            data.append({
                "part_id": part.id,
                "part_name": part.name,
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
    serializer_class = ComponentInstanceSerializer
    permission_classes = [IsEngineerOrAdmin]
    filterset_fields = ("part", "current_dredger")
    search_fields = ("serial_number", "part__name")
    ordering_fields = ("total_hours",)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        comp = self.get_object()
        qs = (comp.repairitem_set
              .select_related("repair", "repair__dredger")
              .order_by("repair__start_date"))
        history = [{
            "repair_id": i.repair_id,
            "dredger":   i.repair.dredger.inv_number,
            "start":     i.repair.start_date,
            "end":       i.repair.end_date,
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
    filterset_fields = ("dredger", "start_date", "end_date")
    search_fields = ("notes",)
    ordering_fields = ("start_date", "-start_date")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
        
# ───────────── component history ─────────────
class ComponentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        qs = (RepairItem.objects
              .select_related("repair__dredger")
              .filter(component_id=pk)
              .order_by("repair__start_date"))
        data = [{
            "repair_id":   ri.repair_id,
            "dredger":     ri.repair.dredger.inv_number,
            "start_date":  ri.repair.start_date,
            "end_date":    ri.repair.end_date,
            "hours":       ri.hours,
            "note":        ri.notes,
        } for ri in qs]
        return Response(data)

