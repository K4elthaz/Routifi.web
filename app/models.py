from django.db import models
from django.utils.text import slugify
import uuid
from django.core.exceptions import ValidationError
from datetime import datetime

class UserProfile(models.Model):
    """Stores user data and links to Supabase."""
    supabase_uid = models.CharField(max_length=255, unique=True, primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    location = models.JSONField(default=list)  # Store [latitude, longitude]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField("Tag", related_name="users", blank=True)
    availability = models.JSONField(default=list)

    def clean(self):
        """Custom validation to ensure user is available on the current day"""
        current_day = datetime.now().weekday()
        if current_day not in self.availability:
            raise ValidationError(f"User is not available today ({current_day})")

        # Validate location format
        if not isinstance(self.location, list) or len(self.location) != 2:
            raise ValidationError("Location must be a list with two elements: [latitude, longitude]")

        lat, lon = self.location
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValidationError("Invalid latitude or longitude values")

    def __str__(self):
        return f"{self.full_name} ({self.supabase_uid})"

class Organization(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    api_key = models.CharField(max_length=32, unique=True)  # Security for leads API
    created_by = models.ForeignKey("UserProfile", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="organization_logos/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)  # Auto-generate slug from name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Membership(models.Model):
    """Tracks user roles within an organization."""
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="memberships")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="members")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    invited_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)  # True when the user accepts the invite

    class Meta:
        unique_together = ("user", "organization")  # A user cannot join the same org twice

    def __str__(self):
        return f"{self.user.email} - {self.organization.name} ({self.role})"

class Tag(models.Model):
    """A tag that can be assigned to users and leads."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="tags")
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Lead(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    organization = models.ForeignKey("Organization", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField(blank=True, null=True)  # Store tags as a list of strings

    def __str__(self):
        return f"{self.name} - {self.organization.name}"


class Settings(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    one_to_one = models.BooleanField(default=False)  # Whether leads are sent to one user at a time

    def save(self, *args, **kwargs):
        # Ensure only one of these flags is True
        if self.one_to_one:
            # Make sure no other organizations have `one_to_one` set to True
            other_settings = Settings.objects.exclude(id=self.id).filter(one_to_one=True)
            if other_settings.exists():
                raise ValueError("Only one organization can have 'one_to_one' set to True.")
        super().save(*args, **kwargs)

class LeadAssignment(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="assignments")
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="lead_assignments")
    assigned_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")],
        default="pending",
    )
    lead_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.lead.name} -> {self.user.email} ({self.status})"
