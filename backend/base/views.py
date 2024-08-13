from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from base.models import Post, PostView, Nomina
from .serializer import NominaSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

class NominaViewSet(viewsets.ModelViewSet):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

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

    user = User.objects.create_user(username=dni, email=email, password=password)
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
@permission_classes([IsAdminUser])
def get_post_views(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    views = PostView.objects.filter(post=post)
    data = [{'first_name': view.user.profile.first_name, 'last_name': view.user.profile.last_name, 'viewed_at': view.viewed_at} for view in views]
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
    data = [{'username': view.user.username, 'viewed_at': view.viewed_at} for view in views]
    return JsonResponse(data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'is_superuser': user.is_superuser,
    })