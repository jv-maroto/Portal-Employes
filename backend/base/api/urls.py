from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MyTokenObtainPairView,
    get_profile,
    post_list,
    post_detail,
    register_post_view,
    get_post_views,
    post_view,
    post_views_list,
    posts_with_views,
    get_nominas_by_username_and_year,
    years_nominas,
    upload_nomina,
    mis_vacaciones,
    listar_todas_vacaciones,
    registrar_vacacion,
    eliminar_vacacion,
)
from base.views import download_nomina

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', get_profile, name='get_profile'),

    # Posts / Comunicados
    path('posts/', post_list, name='post_list'),
    path('posts/<int:pk>/', post_detail, name='post_detail'),
    path('posts/<int:post_id>/view/', post_view, name='post_view'),
    path('posts/<int:post_id>/register-view/', register_post_view, name='register_post_view'),
    path('posts/<int:post_id>/views/', get_post_views, name='get_post_views'),
    path('posts/<int:post_id>/views-list/', post_views_list, name='post_views_list'),
    path('posts/with-views/', posts_with_views, name='posts_with_views'),

    # Nóminas
    path('nominas/<str:username>/<int:year>/', get_nominas_by_username_and_year, name='get_nominas'),
    path('nominas/<str:username>/<int:year>/<str:month>/download/', download_nomina, name='download_nomina'),
    path('nominas/years/', years_nominas, name='years_nominas'),
    path('nominas/upload/', upload_nomina, name='upload_nomina'),

    # Vacaciones
    path('vacaciones/listar/', mis_vacaciones, name='mis_vacaciones'),
    path('vacaciones/todas/', listar_todas_vacaciones, name='listar_todas_vacaciones'),
    path('vacaciones/registrar/', registrar_vacacion, name='registrar_vacacion'),
    path('vacaciones/<int:vacacion_id>/eliminar/', eliminar_vacacion, name='eliminar_vacacion'),
]
