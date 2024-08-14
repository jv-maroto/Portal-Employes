from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from base.models import Post, PostView
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from base.serializer import PostSerializer
from base.serializer import ProfileSerializer, MyTokenObtainPairSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile = user.profile
    serializer = ProfileSerializer(profile, many=False)
    return Response(serializer.data)


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
    return Response({
        'username': user.username,
        'is_superuser': user.is_superuser,
        'email': user.email,
    })
