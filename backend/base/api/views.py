from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from base.models import Post, PostView, PdfFile, Vacacion
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from base.serializer import PostSerializer
from base.serializer import ProfileSerializer, MyTokenObtainPairSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from base.serializer import PdfFileSerializer, VacacionSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        token['username'] = user.username

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET', 'PUT', 'DELETE'])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PostSerializer(post)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def post_list(request):
    if request.method == 'GET':
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    PostView.objects.get_or_create(post=post, user=request.user)
    return Response({'status': 'viewed'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_post_views(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    views = PostView.objects.filter(post=post)
    data = [{'username': view.user.username, 'viewed_at': view.viewed_at}
            for view in views]
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
    try:
        profile = user.profile
        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data)
    except:
        # Si no tiene perfil, devolver datos básicos del usuario
        return Response({
            'username': user.username,
            'is_superuser': user.is_superuser,
            'email': user.email,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def years_nominas(request):
    # Excluye años donde solo hay PDFs de vacaciones
    years = PdfFile.objects.filter(
        user=request.user
    ).exclude(
        file__icontains='vacaciones'
    ).exclude(
        file__icontains='vacacion'
    ).values_list('year', flat=True).distinct().order_by('year')
    return Response(list(years))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nominas_by_username_and_year(request, username, year):
    """
    Obtiene las nóminas de un usuario específico para un año,
    excluyendo cualquier PDF que esté en la carpeta 'vacaciones'
    o que tenga 'vacacion' en el nombre.
    """
    user = get_object_or_404(User, username=username)
    nominas = PdfFile.objects.filter(
        user__username=username,
        year=year
    ).exclude(
        file__icontains='vacaciones'
    ).exclude(
        file__icontains='vacacion'
    ).exclude(
    file__startswith='vacacion_'
    )
    if not nominas.exists():
        return Response({'message': 'No hay nóminas para este año.'}, status=404)

    # Normalizar el mes a dos dígitos antes de serializar
    for n in nominas:
        if not (isinstance(n.month, str) and n.month.isdigit() and len(n.month) == 2):
            meses = {
                'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
                'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12',
                'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
                'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
            }
            mes_lower = str(n.month).strip().lower()
            n.month = meses.get(mes_lower, n.month)
    
    serializer = PdfFileSerializer(nominas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_vacaciones(request):
    vacaciones = Vacacion.objects.filter(user=request.user)
    serializer = VacacionSerializer(vacaciones, many=True)
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def posts_with_views(request):
    posts = Post.objects.all()
    data = []
    for post in posts:
        # Solo un nombre por usuario aunque haya varias visualizaciones
        views = PostView.objects.filter(post=post).select_related("user")
        unique_users = set()
        nombres = []
        for v in views:
            if v.user.username not in unique_users:
                unique_users.add(v.user.username)
                # Si quieres nombre completo:
                if hasattr(v.user, "profile"):
                    nombre = f"{v.user.profile.first_name} {v.user.profile.last_name}"
                else:
                    nombre = v.user.username
                nombres.append(nombre)
        data.append({
            "id": post.id,
            "title": post.title,
            "summary": post.summary,
            "department": post.department,
            "created_at": post.created_at,
            "download_only": post.download_only,
            "pdf": post.pdf.url if post.pdf else None,
            "visualizaciones": nombres,  # Solo un nombre por usuario
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_nomina(request):
    """
    Recibe un PDF, lo guarda y lo procesa.
    """
    file = request.FILES.get('file')
    year = request.data.get('year')
    month = request.data.get('month')
    user = request.user

    if not file or not year or not month:
        return Response({'error': 'Faltan datos'}, status=400)

    pdf_file = PdfFile.objects.create(
        user=user,
        year=year,
        month=month,
        file=file
    )
    pdf_file.process_pdf_and_save()  # <-- Añade esta línea

    return Response({'message': 'Nómina subida correctamente'})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_todas_vacaciones(request):
    vacaciones = Vacacion.objects.all()
    serializer = VacacionSerializer(vacaciones, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_vacacion(request):
    serializer = VacacionSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Solicitud registrada correctamente.'}, status=status.HTTP_201_CREATED)
    else:
        # Devuelve los errores de validación
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from base.models import Vacacion  # Ajusta el nombre del modelo si es diferente

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_vacacion(request, vacacion_id):
    vacacion = get_object_or_404(Vacacion, id=vacacion_id)
    vacacion.delete()
    return Response({'message': 'Vacación eliminada correctamente.'})



