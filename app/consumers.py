import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LeadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.organization_slug = self.scope['url_route']['kwargs']['organization_slug']
        self.group_name = f"leads_{self.organization_slug}"

        # Add user to WebSocket group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from WebSocket group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_lead_notification(self, event):
        """Send lead notification to WebSocket clients."""
        await self.send(text_data=json.dumps({
            "lead_id": event["lead_id"],
            "message": "New lead assigned!",
        }))
