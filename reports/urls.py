from django.urls import path
from .views import RepairsExcelView, DeviationsExcelView

urlpatterns = [
    path("repairs_excel/",    RepairsExcelView.as_view()),
    path("deviations_excel/", DeviationsExcelView.as_view()),
]
