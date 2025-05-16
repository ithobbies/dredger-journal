from rest_framework.routers import DefaultRouter
from .views import DredgerTypeViewSet, SparePartViewSet, DredgerTypePartViewSet

router = DefaultRouter()
router.register("dredger-types", DredgerTypeViewSet)
router.register("spare-parts",  SparePartViewSet)
router.register("type-parts",   DredgerTypePartViewSet)

urlpatterns = router.urls
