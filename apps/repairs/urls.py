from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DredgerViewSet,
    ComponentInstanceViewSet,
    RepairViewSet,
    ComponentHistoryView,        # ← история агрегата
)

router = DefaultRouter()
router.register("dredgers",   DredgerViewSet)          # /api/repairs/dredgers/…
router.register("components", ComponentInstanceViewSet)  # /api/repairs/components/…
router.register("repairs",    RepairViewSet)           # /api/repairs/repairs/…

urlpatterns = router.urls + [
    # GET /api/repairs/components/<pk>/history/
    path(
        "components/<int:pk>/history/",
        ComponentHistoryView.as_view(),
        name="component-history",
    ),
]
