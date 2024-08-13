from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from base.admin import post_admin_site
from base.views import register_user, verify_dni, reset_password

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('base.api.urls')),
    path('verify-dni/', verify_dni, name='verify_dni'),
    path('register/', register_user, name='register_user'),
    path('reset-password/', reset_password, name='reset_password'),
    path('post-admin/', post_admin_site.urls),
    path('ckeditor/', include('ckeditor_uploader.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
