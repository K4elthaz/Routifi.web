import os
import django
from celery import Celery
from celery.schedules import crontab
from django.conf import settings
from datetime import timedelta

# Set up Django environment for Celery
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "routifi.settings")
django.setup()

# Initialize Celery app
app = Celery('routifi')

# Use Redis as broker and backend
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.worker_pool = 'solo'
# Auto-discover tasks
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Configure Celery Beat tasks
app.conf.beat_schedule = {
    'assign-leads-every-minute': {
        'task': 'app.tasks.assign_leads_to_members',  # Use the correct app name!
        'schedule': crontab(minute='*/1'),
    },
        'check-expired-leads': {
        'task': 'app.tasks.check_expired_lead_assignments',
        'schedule': timedelta(minutes=1),  # Runs every minute
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

