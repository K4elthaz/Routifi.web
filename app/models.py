from django.db import models
from django.utils.text import slugify
import uuid

class UserProfile(models.Model):
    """Stores user data and links to Supabase."""
    supabase_uid = models.CharField(max_length=255, unique=True, primary_key=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField("Tag", related_name="users", blank=True)  # Many-to-Many with Tags

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.supabase_uid})"

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


