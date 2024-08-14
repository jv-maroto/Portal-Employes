from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from base.admin import post_admin_site
from base.views import register_user, verify_dni, reset_password, register_post_view, get_post_views, get_profile
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('base.api.urls')),
    path('verify-dni/', verify_dni, name='verify_dni'),
    path('register/', register_user, name='register_user'),
    path('api/posts/<int:post_id>/view/',
         register_post_view, name='register_post_view'),
    path('api/posts/<int:post_id>/views/',
         get_post_views, name='get_post_views'),
    path('reset-password/', reset_password, name='reset_password'),
    path('post-admin/', post_admin_site.urls),
    path('api/profile/', get_profile, name='get_profile'),
    path('ckeditor/', include('ckeditor_uploader.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
