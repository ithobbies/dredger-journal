from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
)
from apps.core.views import CurrentUserView   # создадим ниже

urlpatterns = [
    path("admin/", admin.site.urls),

    # --- auth ---
    path("api/auth/login/",  TokenObtainPairView.as_view(), name="jwt_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(),  name="jwt_refresh"),
    path("api/auth/user/", CurrentUserView.as_view(),      name="current_user"),

    # --- будущие API приложений ---
    # path("api/", include("apps.repairs.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
