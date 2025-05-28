from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DredgerViewSet,
    ComponentInstanceViewSet,
    RepairViewSet,
    AvailableComponentsView
)

router = DefaultRouter()
router.register("dredgers", DredgerViewSet)
router.register("components", ComponentInstanceViewSet)
router.register("repairs", RepairViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("available-components/", AvailableComponentsView.as_view(), name="available-components"),
]
