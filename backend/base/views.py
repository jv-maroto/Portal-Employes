# backend/myapp/views.py

from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Nomina
from .serializer import NominaSerializer


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
