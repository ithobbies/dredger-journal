from rest_framework import serializers
from .models import Dredger, ComponentInstance, Repair, RepairItem
from apps.refdata.serializers import SparePartSerializer


class DredgerSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source="type.name", read_only=True)

    class Meta:
        model = Dredger
        fields = ("id", "inv_number", "type", "type_name")


class ComponentInstanceSerializer(serializers.ModelSerializer):
    part = SparePartSerializer(read_only=True)

    class Meta:
        model = ComponentInstance
        fields = "__all__"


class RepairItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairItem
        fields = ("component", "hours", "note")


class RepairItemReadSerializer(serializers.ModelSerializer):
    component = ComponentInstanceSerializer(read_only=True)

    class Meta:
        model = RepairItem
        fields = ("id", "component", "hours", "note")


class RepairSerializer(serializers.ModelSerializer):
    items = RepairItemWriteSerializer(many=True, write_only=True)
    items_read = RepairItemReadSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Repair
        fields = (
            "id",
            "dredger",
            "start_date",
            "end_date",
            "notes",
            "items",
            "items_read",
            "created_by",
            "created_at",
            "updated_by",
            "updated_at",
        )
        read_only_fields = ("created_by", "created_at", "updated_by", "updated_at")

    # создание / обновление
    def create(self, validated_data):
        items = validated_data.pop("items")
        repair = Repair.objects.create(**validated_data)
        RepairItem.objects.bulk_create(
            [RepairItem(repair=repair, **item) for item in items]
        )
        return repair

    def update(self, instance, validated_data):
        validated_data.pop("items", None)  # вложенные не правим
        return super().update(instance, validated_data)
