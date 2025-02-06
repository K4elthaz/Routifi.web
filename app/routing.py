from django.urls import re_path
from .consumers import LeadConsumer

websocket_urlpatterns = [
    re_path(r'ws/lead/(?P<lead_id>\d+)/$', LeadConsumer.as_asgi(), name='lead-consumer'),
]
