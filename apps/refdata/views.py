from rest_framework import viewsets
from apps.core.permissions import IsEngineerOrAdmin
from rest_framework.parsers import MultiPartParser, FormParser
from .models import DredgerType, SparePart, DredgerTypePart
from .serializers import (
    DredgerTypeSerializer, SparePartSerializer, DredgerTypePartSerializer,
)

class DredgerTypeViewSet(viewsets.ModelViewSet):
    queryset = DredgerType.objects.all()
    serializer_class = DredgerTypeSerializer
    permission_classes = [IsEngineerOrAdmin]
    search_fields = ("name", "code")

class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsEngineerOrAdmin]
    filterset_fields = ("manufacturer",)
    search_fields = ("code", "name", "manufacturer")
    ordering_fields = ("code", "name", "norm_hours")

class DredgerTypePartViewSet(viewsets.ModelViewSet):
    queryset = DredgerTypePart.objects.all()
    serializer_class = DredgerTypePartSerializer
    permission_classes = [IsEngineerOrAdmin]
    filterset_fields = ("dredger_type", "part")
