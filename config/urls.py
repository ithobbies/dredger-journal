"""
dredger-journal · главный URL-маршрутизатор
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Simple-JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# «Кто я» — отдаёт id / username / roles[]
from apps.core.views import CurrentUserView

urlpatterns = [
    # ───────────── Django admin ─────────────
    path("admin/", admin.site.urls),

    # ───────────── Auth (JWT) ─────────────
    path("api/auth/login/",   TokenObtainPairView.as_view(), name="jwt_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(),    name="jwt_refresh"),
    path("api/auth/user/",    CurrentUserView.as_view(),     name="current_user"),

    # ───────────── Business API ─────────────
    # справочники (типы землесосов, запчасти, комплектность)
    path("api/refdata/", include("apps.refdata.urls")),
    # землесосы, агрегаты, ремонты (+ template / history actions)
    path("api/", include("apps.repairs.urls")),
    # отклонения (простой/аварии)
    path("api/", include("apps.deviations.urls")),
    # Отчёты Excel
    path("api/reports/", include("apps.reports.urls")),
]

# ───────────── Media (DEBUG) ─────────────
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
