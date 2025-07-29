from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from base.admin import post_admin_site  # Comentado porque no existe
from base import views
from base.views import register_user, verify_dni, reset_password, register_post_view, get_post_views, get_profile, years_nominas, registrar_vacacion, listar_vacaciones, list_posts, post_detail, listar_todas_vacaciones
from base.api.views import mis_vacaciones,  posts_with_views, upload_nomina
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/logout/', views.logout_user, name='logout_user'),
    path('api/login/', views.login_user, name='login_user'),
    path('api/', include('base.api.urls')),
    path('verify-dni/', verify_dni, name='verify_dni'),
    path('register/', register_user, name='register_user'),
    path('api/posts/<int:post_id>/view/',
         register_post_view, name='register_post_view'),
    path('api/posts/<int:post_id>/views/',
         get_post_views, name='get_post_views'),
    path('api/posts/', list_posts, name='list_posts'),
    path('api/posts/<int:post_id>/', post_detail, name='post_detail'),
    path('reset-password/', reset_password, name='reset_password'),
    # path('post-admin/', post_admin_site.urls),  # Comentado porque post_admin_site no existe
    path('api/profile/', get_profile, name='get_profile'),
    # path('ckeditor/', include('ckeditor_uploader.urls')), # Removido por seguridad
    path('api/years-nominas/', years_nominas, name='years-nominas'),
    path('api/nominas/<str:username>/<int:year>/',
         views.get_nominas_by_username_and_year, name='get_nominas_by_username_and_year'),
    path('api/vacaciones/registrar/',
         registrar_vacacion, name='registrar-vacacion'),
    path('api/vacaciones/listar/', listar_vacaciones, name='listar-vacaciones'),
    path('api/mis-vacaciones/', mis_vacaciones, name='mis-vacaciones'),
    path('api/todas-vacaciones/', listar_todas_vacaciones, name='todas-vacaciones'),
    path('api/posts-with-views/', posts_with_views, name='posts-with-views'),
    path('api/upload-nomina/', upload_nomina, name='upload-nomina'),
    path('vacaciones/<int:vacacion_id>/eliminar/', views.eliminar_vacacion, name='eliminar-vacacion'),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
