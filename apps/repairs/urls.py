from rest_framework.routers import DefaultRouter
from .views import DredgerViewSet, ComponentInstanceViewSet, RepairViewSet

router = DefaultRouter()
router.register("dredgers",   DredgerViewSet)
router.register("components", ComponentInstanceViewSet)
router.register("repairs",    RepairViewSet)

urlpatterns = router.urls
