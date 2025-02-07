from django.urls import re_path
from .consumers import LeadConsumer

websocket_urlpatterns = [
    re_path(r'ws/leads/(?P<organization_slug>\w+)/$', LeadConsumer.as_asgi()),
]
