# Generated by Django 5.1.5 on 2025-03-01 02:30

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Lead',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=50)),
                ('location', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tags', models.JSONField(default=list)),
            ],
        ),
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('slug', models.SlugField(blank=True, null=True, unique=True)),
                ('api_key', models.CharField(max_length=32, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='organization_logos/')),
            ],
        ),
        migrations.CreateModel(
            name='LeadsInQueue',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leads_in_queue', to='app.lead')),
            ],
        ),
        migrations.AddField(
            model_name='lead',
            name='organization',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.organization'),
        ),
        migrations.CreateModel(
            name='Settings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('one_to_one', models.BooleanField(default=False)),
                ('organization', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='app.organization')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='app.organization')),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('supabase_uid', models.CharField(max_length=255, primary_key=True, serialize=False, unique=True)),
                ('full_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('location', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('availability', models.JSONField(default=list)),
                ('LeadsOwned', models.ManyToManyField(blank=True, null=True, to='app.lead')),
                ('tags', models.ManyToManyField(blank=True, related_name='users', to='app.tag')),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='organization',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.userprofile'),
        ),
        migrations.CreateModel(
            name='LeadHistory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user_choice', models.CharField(max_length=20)),
                ('user_response_time', models.PositiveIntegerField(blank=True, null=True)),
                ('action', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='app.lead')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_lead_history', to='app.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='LeadAssignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('expired', 'Expired')], default='pending', max_length=20)),
                ('lead_link', models.URLField(blank=True, null=True)),
                ('expires_at', models.DateTimeField()),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='app.lead')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lead_assignments', to='app.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('role', models.CharField(choices=[('owner', 'Owner'), ('admin', 'Admin'), ('member', 'Member')], default='member', max_length=20)),
                ('invited_at', models.DateTimeField(auto_now_add=True)),
                ('accepted', models.BooleanField(default=False)),
                ('invite_status', models.CharField(default='pending', max_length=20)),
                ('is_user', models.BooleanField(default=False)),
                ('invite_code', models.CharField(blank=True, max_length=10, null=True, unique=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='app.organization')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='app.userprofile')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('user', 'organization'), name='unique_membership')],
            },
        ),
    ]
