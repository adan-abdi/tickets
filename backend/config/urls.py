from django.urls import path
from tickets import views

urlpatterns = [
    path("tickets", views.ticket_collection),
    path("tickets/stats", views.ticket_stats),
    path("tickets/<int:ticket_id>", views.ticket_detail),
]
