from rest_framework import serializers
from .models import DredgerType, SparePart, DredgerTypePart


class DredgerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DredgerType
        fields = "__all__"


class SparePartSerializer(serializers.ModelSerializer):
    # URL-адрес файла приходит от DRF автоматически
    drawing_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model  = SparePart
        fields = "__all__"


class DredgerTypePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DredgerTypePart
        fields = "__all__"

