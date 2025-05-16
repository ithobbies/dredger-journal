from rest_framework import serializers
from .models import Deviation


class DeviationSerializer(serializers.ModelSerializer):
    dredger_number = serializers.CharField(
        source="dredger.inv_number", read_only=True
    )

    class Meta:
        model = Deviation
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_by", "updated_at")
