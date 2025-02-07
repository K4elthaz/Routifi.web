import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class LeadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.organization_slug = self.scope['url_route']['kwargs']['organization_slug']
        self.room_group_name = f"leads_{self.organization_slug}"

        logger.info(f"WebSocket connection attempt for organization: {self.organization_slug}")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        logger.info(f"WebSocket connection established for {self.organization_slug}")

    async def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected for organization: {self.organization_slug}")

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')

            logger.info(f"Received message from WebSocket: {message}")

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'lead_notification',
                    'message': message
                }
            )
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in WebSocket")
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))

    async def lead_notification(self, event):
        message = event['message']

        logger.info(f"Sending lead notification: {message}")

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
