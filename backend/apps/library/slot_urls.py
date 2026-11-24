from django.urls import path
from .views import TimeSlotListView

urlpatterns = [
    path('', TimeSlotListView.as_view(), name='slot_list'),
]
