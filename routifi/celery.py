import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'routifi.settings')

# Initialize the Celery app
app = Celery('routifi')

# Load task modules from all registered Django apps
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from Django apps, including your app (e.g. app)
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Set the worker pool to solo (useful for debugging, but not recommended for production)
app.conf.worker_pool = 'solo'

# Celery Beat schedule (Periodic tasks)
app.conf.beat_schedule = {
    'expire-unaccepted-leads': {
        'task': 'app.tasks.expire_unaccepted_leads',  # Correct task path
        'schedule': crontab(minute='*/10'),  # Runs every 10 minutes
    },
}
