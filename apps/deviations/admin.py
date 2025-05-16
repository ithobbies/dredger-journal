from django.contrib import admin
from .models import Deviation


@admin.register(Deviation)
class DeviationAdmin(admin.ModelAdmin):
    list_display = ("date", "dredger", "type", "location", "created_by")
    list_filter = ("type", "location", "dredger")
    search_fields = ("dredger__inv_number", "description")
    readonly_fields = ("created_by", "created_at", "updated_by", "updated_at")

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)
