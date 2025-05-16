from django.contrib import admin
from .models import (
    Dredger,
    ComponentInstance,
    Repair,
    RepairItem,
)


@admin.register(Dredger)
class DredgerAdmin(admin.ModelAdmin):
    list_display = ("inv_number", "type")
    search_fields = ("inv_number",)
    list_filter = ("type",)


@admin.register(ComponentInstance)
class ComponentInstanceAdmin(admin.ModelAdmin):
    list_display = ("part", "serial_number", "current_dredger", "total_hours")
    search_fields = ("serial_number", "part__name", "current_dredger__inv_number")
    list_filter = ("part", "current_dredger")


class RepairItemInline(admin.TabularInline):
    model = RepairItem
    extra = 0


@admin.register(Repair)
class RepairAdmin(admin.ModelAdmin):
    list_display = ("dredger", "start_date", "end_date", "created_by")
    list_filter = ("dredger", "start_date")
    search_fields = ("dredger__inv_number",)
    inlines = (RepairItemInline,)
    readonly_fields = ("created_by", "created_at", "updated_by", "updated_at")

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)
