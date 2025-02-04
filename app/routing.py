from django.urls import path
from .consumers import LeadConsumer

websocket_urlpatterns = [
    path("ws/leads/<str:organization_slug>/", LeadConsumer.as_asgi()),
]
