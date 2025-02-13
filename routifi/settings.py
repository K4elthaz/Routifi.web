import dj_database_url
import environ
import os
from pathlib import Path
import redis

BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Security settings
SECRET_KEY = 'django-insecure-gz4+sy8tddk80ezn3+al+hqbd0*_8ny)c%de0-f=7wfg@!3&0$'
DEBUG = True
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True

# Redis URL (load from .env or fallback to default)
REDIS_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")

# Function to lazily initialize Redis client
def get_redis_client():
    return redis.StrictRedis.from_url(REDIS_URL)

# Celery settings for asynchronous tasks
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_IMPORTS = ('app.tasks',)

# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',  
    'app',
    'corsheaders',
    'channels',
    'django_celery_beat',
]

# Middleware settings
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

# URL settings
ROOT_URLCONF = 'routifi.urls'

# Templates settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ASGI settings
ASGI_APPLICATION = 'routifi.asgi.application'

# Channel layer settings for WebSockets (using Redis)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(env.str("REDIS_HOST", default="localhost"), 6379)],
        },
    },
}

# WSGI settings
WSGI_APPLICATION = 'routifi.wsgi.application'

# Database settings (use DATABASE_URL from the environment)
DATABASES = {
    "default": dj_database_url.parse(os.environ.get("DATABASE_URL"))
}

# Authentication settings
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.yourprovider.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "your-email@example.com"
EMAIL_HOST_PASSWORD = "your-password"

# Language and timezone settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# External API settings (e.g., Supabase)
SUPABASE_PROJECT_URL = os.environ.get("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = os.environ.get("SUPABASE_API_KEY")

# Static files settings
STATIC_URL = 'static/'

# Default auto field setting
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
