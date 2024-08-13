from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import MyTokenObtainPairView
from base.views import NominaViewSet

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

# Crear un DefaultRouter y registrar el NominaViewSet
router = DefaultRouter()
router.register(r'nominas', NominaViewSet)

urlpatterns = [
    path('profile/', views.get_profile),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('posts/', views.post_list, name='post_list'),
    path('posts/<int:pk>/', views.post_detail, name='post_detail'),
    path('ckeditor/', include('ckeditor_uploader.urls')),

    # Incluir las rutas generadas por el router
    path('', include(router.urls)),
]

# Solo para desarrollo: servir archivos estáticos y de medios
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
