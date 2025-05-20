from django_filters.rest_framework import FilterSet, DateFilter
from rest_framework import viewsets
from apps.core.permissions import ReadOnlyOrOperatorEngineer
from .models import Deviation
from .serializers import DeviationSerializer

class DeviationFilter(FilterSet):
    date_after = DateFilter(field_name="date", lookup_expr="gte")
    date_before = DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Deviation
        fields = ["dredger", "type", "location", "date_after", "date_before"]

class DeviationViewSet(viewsets.ModelViewSet):
    queryset = Deviation.objects.select_related("dredger")
    serializer_class = DeviationSerializer
    permission_classes = [ReadOnlyOrOperatorEngineer]
    filterset_class = DeviationFilter
    search_fields = ("description",)
    ordering_fields = ("date", "-date", "dredger")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
