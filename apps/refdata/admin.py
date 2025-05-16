from django.contrib import admin
from .models import DredgerType, SparePart, DredgerTypePart


@admin.register(DredgerType)
class DredgerTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(SparePart)
class SparePartAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "manufacturer", "norm_hours")
    search_fields = ("code", "name", "manufacturer")
    list_filter = ("manufacturer",)
    readonly_fields = ("drawing_file",)   # позволяет скачивать файл


@admin.register(DredgerTypePart)
class DredgerTypePartAdmin(admin.ModelAdmin):
    list_display = ("dredger_type", "part")
    list_filter = ("dredger_type",)
