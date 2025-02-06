import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "routifi.settings")  # Ensure this is correct

import django
django.setup()  # Initialize Django before using settings or models

from celery.schedules import crontab
from django.conf import settings
from app.models import Lead  # Now it's safe to import models

# Initialize the Celery app
app = Celery('routifi')
app.conf.worker_pool = 'solo'
# Load task modules from all registered Django apps
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from Django apps
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Define scheduled tasks
app.conf.beat_schedule = {
    'expire-unaccepted-leads': {
        'task': 'app.tasks.expire_unaccepted_leads',
        'schedule': crontab(minute='*/10'),
    },
    'assign-next-lead': {
        'task': 'app.tasks.assign_next_lead_from_queue',
        'schedule': crontab(minute='*/1'),
    },
}
