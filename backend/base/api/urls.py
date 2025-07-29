from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Importar solo las views que sabemos que existen
try:
    from .views import MyTokenObtainPairView, get_profile
    token_view = MyTokenObtainPairView.as_view()
    profile_view = get_profile
except ImportError:
    # Fallback si hay problemas con las importaciones
    from rest_framework_simplejwt.views import TokenObtainPairView
    token_view = TokenObtainPairView.as_view()
    
    def profile_view(request):
        from rest_framework.response import Response
        return Response({'message': 'Profile endpoint temporarily disabled'})

urlpatterns = [
    path('token/', token_view, name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', profile_view, name='get_profile'),
]