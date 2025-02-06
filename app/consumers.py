import json
from datetime import timedelta
import uuid
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import LeadAssignment, Lead, UserProfile
from asgiref.sync import sync_to_async
from django.core.exceptions import ObjectDoesNotExist
import redis

redis_client = redis.StrictRedis.from_url('redis://localhost:6379')  # Make sure your Redis URL is correctly set up.

class LeadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"
            # Add this WebSocket to the group for the user.
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            # Send a message confirming the connection.
            await self.send(text_data=json.dumps({"message": "Connected to lead notifications"}))
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Remove this WebSocket from the group when the user disconnects.
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "accept":
            # Call the method to accept a lead.
            await self.accept_lead(data["lead_id"], data["token"])
        elif action == "reject":
            # Call the method to reject a lead.
            await self.reject_lead(data["lead_id"], data["token"])

    @sync_to_async
    def accept_lead(self, lead_id, token):
        try:
            # Find the assignment for the user and the lead.
            assignment = LeadAssignment.objects.filter(lead_id=lead_id, user=self.user, status="pending").first()

            if assignment and str(assignment.token) == token:
                # Change the lead and assignment status to "accepted".
                assignment.status = "accepted"
                assignment.save()
                lead = assignment.lead
                lead.status = "accepted"
                lead.save()

                # Add to LeadHistory: mark the lead as accepted.
                LeadHistory.objects.create(lead=lead, user=self.user, action="accepted", timestamp=timezone.now())

                # Notify other systems via WebSocket about this change.
                return {"message": "Lead accepted"}
            return {"error": "Invalid lead assignment or token"}
        except ObjectDoesNotExist:
            return {"error": "Lead or assignment not found"}

    @sync_to_async
    def reject_lead(self, lead_id, token):
        try:
            # Find the assignment for the user and the lead.
            assignment = LeadAssignment.objects.filter(lead_id=lead_id, user=self.user, status="pending").first()

            if assignment and str(assignment.token) == token:
                # Change the lead and assignment status to "rejected".
                assignment.status = "rejected"
                assignment.save()

                # Add to LeadHistory: mark the lead as rejected.
                LeadHistory.objects.create(lead=assignment.lead, user=self.user, action="rejected", timestamp=timezone.now())

                # Add the user to the rejected list in Redis.
                redis_client.rpush(f"lead:{lead_id}:rejected_users", str(self.user.id))

                # Reassign the lead to the next available user from the queue.
                self.reassign_lead(assignment.lead)

                return {"message": "Lead rejected"}
            return {"error": "Invalid lead assignment or token"}
        except ObjectDoesNotExist:
            return {"error": "Lead or assignment not found"}

    def reassign_lead(self, lead):
        """Find next available user and send lead via WebSocket"""
        next_user = self.find_next_available_user(lead)
        if next_user:
            token = uuid.uuid4()
            expires_at = timezone.now() + timedelta(minutes=10)

            LeadAssignment.objects.create(
                lead=lead,
                user=next_user,
                assigned_at=timezone.now(),
                status="pending",
                token=token,
                expires_at=expires_at,
            )

            # Notify the next user that a new lead is available for them.
            self.notify_user(next_user, lead, token)

    def find_next_available_user(self, lead):
        """Get the next user who hasn't rejected the lead."""
        rejected_users = redis_client.lrange(f"lead:{lead.id}:rejected_users", 0, -1)
        rejected_users = [uid.decode() for uid in rejected_users]
        available_users = UserProfile.objects.exclude(id__in=rejected_users)
        return available_users.first()  # Get the first available user, you can adjust this to pick based on other criteria

    async def notify_user(self, user, lead, token):
        """Send a WebSocket notification to a specific user."""
        await self.channel_layer.group_send(
            f"user_{user.id}",
            {
                "type": "send_lead_notification",
                "lead_id": lead.id,
                "lead_link": f"http://localhost:8000/lead/{lead.id}/accept/{token}/",
            },
        )

    async def send_lead_notification(self, event):
        """Handle sending notifications to users over WebSocket."""
        await self.send(text_data=json.dumps(event))
