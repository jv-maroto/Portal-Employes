
from django.urls import path, include
from . import views
from django.conf import settings
from rest_framework.routers import DefaultRouter
from base.views import PdfFileViewSet
from django.conf.urls.static import static
from .views import MyTokenObtainPairView, post_list, post_detail, register_post_view, get_post_views, get_profile, years_nominas
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
# Crear un DefaultRouter y registrar
router = DefaultRouter()
router.register(r'Nominas', PdfFileViewSet)
urlpatterns = [
    path('profile/', views.get_profile),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('posts/', views.post_list, name='post_list'),
    path('posts/<int:pk>/', views.post_detail, name='post_detail'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('posts/<int:post_id>/view/',
         register_post_view, name='register_post_view'),
    path('api/posts/<int:post_id>/views/',
         get_post_views, name='get_post_views'),
    path('grappelli/', include('grappelli.urls')),
    path('', include(router.urls)),
    path('api/years-nominas/', years_nominas, name='years_nominas'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
