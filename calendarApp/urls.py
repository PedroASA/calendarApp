
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("log-user", views.login_view, name="login"),
    path("log-user-out", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-event", views.create_event, name="create-event"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("event/<int:event_id>", views.event, name="event"),
    path("calendar/", views.calendar, name="calendar"),
    path("eventsDay/<int:month>/<int:day>", views.events_by_day, name="events_by_day"),
    path("eventsMonth/<int:month>", views.events_by_month, name="events_by_month")
]
