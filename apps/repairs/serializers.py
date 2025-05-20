from django.db import transaction
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
        read_only_fields = ("part",)  # все поля только для чтения в этом представлении

class ComponentInstanceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentInstance
        fields = ("id", "part", "serial_number", "current_dredger", "total_hours")

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

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        with transaction.atomic():
            repair = Repair.objects.create(**validated_data)
            for item in items_data:
                comp = item["component"]         # новый устанавливаемый агрегат (ComponentInstance)
                hours = item.get("hours", 0)     # наработка старого агрегата до замены
                # Отвязываем старый агрегат этого типа от землесоса (если есть) и обновляем его наработку
                old_comp = repair.dredger.components.filter(part_id=comp.part_id).first()
                if old_comp:
                    old_comp.current_dredger = None
                    old_comp.total_hours += hours
                    old_comp.save()
                # Привязываем новый агрегат к землесосу
                comp.current_dredger = repair.dredger
                comp.save()
                RepairItem.objects.create(repair=repair, **item)
        return repair

    def update(self, instance, validated_data):
        # Запрет редактирования пунктов ремонта через данный сериализатор
        if "items" in validated_data:
            raise serializers.ValidationError({"items": "Нельзя редактировать состав ремонта через этот эндпоинт."})
        return super().update(instance, validated_data)
