from rest_framework.routers import DefaultRouter
from .views import DeviationViewSet

router = DefaultRouter()
router.register("deviations", DeviationViewSet)

urlpatterns = router.urls
