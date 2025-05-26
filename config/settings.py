"""
Django settings for dredger-journal
–––––––––––––––––––––––––––––––––––
✓ SQLite
✓ DRF + Simple-JWT
✓ Пагинация, поиск, сортировка
✓ CORS для Vite (5173)
"""

from pathlib import Path
from datetime import timedelta
import os

# ──────────────────────────── базовые ─────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "replace-me-in-prod"
DEBUG = True
ALLOWED_HOSTS: list[str] = ["*"]           # dev

# ──────────────────────────── приложения ──────────────────────────
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 3-rd party
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "django_filters",
    "corsheaders",
    # local apps
    "apps.core",
    "apps.refdata",
    "apps.repairs",
    "apps.deviations",
    "apps.reports",
]

# ──────────────────────────── middleware ──────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",          # CORS первым!
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# ──────────────────────────── базы данных ─────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ──────────────────────────── шаблоны ─────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],      # можно оставить пустым
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

# ──────────────────────────── DRF / JWT ───────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ──────────────────────────── CORS ────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",        # Vite
    "http://127.0.0.1:5173",       # Vite alternative
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ──────────────────────────── static / media ──────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ──────────────────────────── локаль / время ─────────────────────
LANGUAGE_CODE = "ru"
TIME_ZONE = "Europe/Kyiv"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
