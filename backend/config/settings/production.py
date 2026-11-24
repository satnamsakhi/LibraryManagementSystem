from .base import *

DEBUG = False

# Strict host and CORS validation in production
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'yourdomain.com,www.yourdomain.com').split(',')
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'https://yourdomain.com'),
]

# Security headers
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
