from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from base.models import Post, PostView, PdfFile, Vacacion
from .serializer import PdfFileSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from .models import Vacacion
from xhtml2pdf import pisa
from io import BytesIO
from django.core.mail import EmailMessage
from django.conf import settings
from .serializer import PdfFileSerializer, VacacionSerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
from django.templatetags.static import static
from rest_framework import serializers, status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializer import PostSerializer
from django.contrib.staticfiles import finders
from .serializer import generar_pdf_html_vacacion

class LoginSerializer(serializers.Serializer):
    dni = serializers.CharField(max_length=9)
    password = serializers.CharField(write_only=True)

class PdfFileViewSet(viewsets.ModelViewSet):
    queryset = PdfFile.objects.all()

    serializer_class = PdfFileSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        'first_name': user.first_name,
        'last_name': user.last_name,
        'username': user.username,
        'is_superuser': user.is_superuser,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        # Revocar el token de acceso y refresh
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()  # Agregar a la lista negra
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    username = request.data.get('dni')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        # Generar el token JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
             'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def years_nominas(request):
    anos = PdfFile.objects.filter(user=request.user).values_list(
        'year', flat=True).distinct()
    print(f"Años encontrados: {list(anos)}")  # Agrega esto para depuración
    return JsonResponse(list(anos), safe=False)


@api_view(['POST'])
def verify_dni(request):
    dni = request.data.get('dni')
    try:
        user = User.objects.get(username=dni)
        return Response({'message': 'DNI found'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'DNI not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    dni = request.data.get('dni')
    password = request.data.get('password')

    if User.objects.filter(username=dni).exists():
        return Response({'message': 'DNI already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=dni, email=email, password=password)
    user.save()
    return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def reset_password(request):
    dni = request.data.get('dni')
    new_password = request.data.get('new_password')

    try:
        user = User.objects.get(username=dni)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'DNI not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    PostView.objects.get_or_create(post=post, user=request.user)
    return Response({'status': 'viewed'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_posts(request):
    """
    GET /api/posts/?department=Eventos
    """
    department = request.query_params.get('department', None)
    qs = Post.objects.filter(department=department) if department else Post.objects.all()
    serializer = PostSerializer(qs.order_by('-date'), many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_detail(request, post_id):
    """
    GET /api/posts/123/
    """
    post = get_object_or_404(Post, id=post_id)
    serializer = PostSerializer(post)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_post_views(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    views = PostView.objects.filter(post=post)
    data = [{'first_name': view.user.profile.first_name,
             'last_name': view.user.profile.last_name, 'viewed_at': view.viewed_at} for view in views]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    PostView.objects.get_or_create(post=post, user=request.user)
    return JsonResponse({'status': 'viewed'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def post_views_list(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    views = PostView.objects.filter(post=post)
    data = [{'username': view.user.username, 'viewed_at': view.viewed_at}
            for view in views]
    return JsonResponse(data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'is_superuser': user.is_superuser,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nominas_by_username_and_year(request, username, year):
    """
    Obtiene las nóminas de un usuario específico para un año.
    Solo el propio usuario o un administrador pueden acceder.
    """
    logged_in_user = request.user
    user = get_object_or_404(User, username=username)
    if logged_in_user != user and not logged_in_user.is_superuser:
        return Response({'message': 'No tienes permiso para acceder a estas nóminas.'}, status=403)
    nominas = PdfFile.objects.filter(user=user, year=year) \
        .exclude(file__icontains='vacaciones') \
        .exclude(file__icontains='vacacion') \
        .exclude(file__startswith='vacacion_')
    if not nominas.exists():
        return Response({'message': 'No hay nóminas para este año.'}, status=404)
    serializer = PdfFileSerializer(nominas, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_vacacion(request):
    serializer = VacacionSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        vacacion = serializer.save()

        # Generar el PDF con los detalles de la vacación
        buffer = generar_pdf_html_vacacion(vacacion)

        if buffer:
            # Enviar el PDF generado por correo
            pdf_filename = f'vacacion_{vacacion.user.username}.pdf'
            subject = f"Confirmación de Vacaciones: {vacacion.user.first_name} {vacacion.user.last_name}"
            email_message = EmailMessage(
                subject=subject,
                body="Adjunto encontrarás el documento de confirmación de tus vacaciones.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[vacacion.email]
            )
            email_message.attach(pdf_filename, buffer.getvalue(), 'application/pdf')
            email_message.send()

            return Response({'message': 'Vacación registrada y PDF enviado por correo.'}, status=status.HTTP_201_CREATED)

        return Response({'error': 'Error al generar el PDF'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Vista para listar todas las solicitudes de vacaciones del usuario actual
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_vacaciones(request):
    vacaciones = Vacacion.objects.filter(user=request.user)
    serializer = VacacionSerializer(vacaciones, many=True)
    
    return Response(serializer.data)

# Vista para listar las vacaciones de un usuario específico
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_vacaciones_usuario(request, username):
    user = get_object_or_404(User, username=username)
    vacaciones = Vacacion.objects.filter(user=user)
    serializer = VacacionSerializer(vacaciones, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_todas_vacaciones(request):
    vacaciones = Vacacion.objects.all()
    serializer = VacacionSerializer(vacaciones, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_vacacion(request, vacacion_id):
    vacacion = get_object_or_404(Vacacion, id=vacacion_id)
    vacacion.delete()
    return Response({'message': 'Vacación eliminada correctamente.'})
