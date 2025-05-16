from rest_framework import viewsets
from apps.core.permissions import ReadOnlyOrOperatorEngineer
from .models import Deviation
from .serializers import DeviationSerializer

class DeviationViewSet(viewsets.ModelViewSet):
    queryset = Deviation.objects.select_related("dredger")
    serializer_class = DeviationSerializer
    permission_classes = [ReadOnlyOrOperatorEngineer]
    filterset_fields = ("type", "location", "dredger", "date")
    search_fields = ("description",)
    ordering_fields = ("date", "-date", "dredger")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
