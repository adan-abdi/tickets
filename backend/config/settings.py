import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "development-only-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]
INSTALLED_APPS = ["django.contrib.contenttypes", "tickets"]
MIDDLEWARE = ["config.cors.LocalFrontendCorsMiddleware", "django.middleware.common.CommonMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = []
WSGI_APPLICATION = "config.wsgi.application"

if os.environ.get("SQLITE_FOR_TESTS") == "1":
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": os.environ.get("SQLITE_DATABASE_PATH", ":memory:")}}
else:
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "tickets"),
        "USER": os.environ.get("POSTGRES_USER", "tickets"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "tickets"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
