from .models import Vacacion, PdfFile
from rest_framework import serializers
from base.models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.files.base import ContentFile
from xhtml2pdf import pisa
from django.template.loader import render_to_string
import os
from django.conf import settings
import base64
from io import BytesIO
from datetime import timedelta
from drf_extra_fields.fields import Base64ImageField
from django.contrib.staticfiles import finders

def link_callback(uri, rel):
    if uri.startswith(settings.MEDIA_URL):
        path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, ""))
    elif uri.startswith(settings.STATIC_URL):
        path = finders.find(uri.replace(settings.STATIC_URL, ""))
        if not path:
            path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, ""))
    else:
        return uri
    if not os.path.isfile(path):
        raise Exception('El archivo %s no existe' % path)
    return path

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Profile
        fields = ('user', 'first_name', 'last_name', 'dni')


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class PdfFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PdfFile
        fields = ['user', 'year', 'month', 'file', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Normalizar el mes a dos dígitos en la respuesta
        month = data.get('month')
        if month and (not (isinstance(month, str) and month.isdigit() and len(month) == 2)):
            meses = {
                'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
                'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12',
                'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
                'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
            }
            mes_lower = str(month).strip().lower()
            data['month'] = meses.get(mes_lower, month)
        return data


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        token['userid'] = user.user_id

        return token


class VacacionSerializer(serializers.ModelSerializer):
    dias_restantes = serializers.SerializerMethodField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    firma = Base64ImageField()
    nombre = serializers.SerializerMethodField()
    dni = serializers.SerializerMethodField()
    tipo = serializers.CharField(source='motivo', read_only=True)  # <-- SOLO de salida
    dias = serializers.SerializerMethodField()

    class Meta:
        model = Vacacion
        fields = [
            'id', 'motivo', 'inicio', 'fin', 'user', 'email', 'firma', 'dias_restantes',
            'nombre', 'dni', 'tipo', 'dias', 'year', 'month'
        ]
        read_only_fields = ['id', 'user', 'dias_restantes', 'tipo']  # <-- Añade 'tipo' aquí

    def get_dias_restantes(self, obj):
        total_dias = 30
        vacaciones = Vacacion.objects.filter(user=obj.user).exclude(id=obj.id)
        dias_usados = sum(
            [(vacacion.fin - vacacion.inicio).days + 1 for vacacion in vacaciones]
        )
        return total_dias - dias_usados

    # --- Métodos añadidos para frontend ---
    def get_nombre(self, obj):
        profile = getattr(obj.user, 'profile', None)
        if profile:
            return f"{profile.first_name} {profile.last_name}"
        return obj.user.username

    def get_dni(self, obj):
        profile = getattr(obj.user, 'profile', None)
        if profile:
            return profile.dni
        return ""

    def get_dias(self, obj):
        return (obj.fin - obj.inicio).days + 1
    # --------------------------------------

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        firma_file = validated_data.pop('firma', None)
        validated_data.pop('user', None)

        vacacion = Vacacion(user=user, **validated_data)

        # Asigna la firma si está presente
        if firma_file:
            vacacion.firma = firma_file

        vacacion.save()
        # Elimina la llamada a self.generar_y_asociar_pdf(vacacion)
        return vacacion

    def validate(self, data):
        user = self.context['request'].user
        motivo = data.get('motivo')
        inicio = data.get('inicio')
        fin = data.get('fin')
        year = data.get('year') or (inicio.year if inicio else None)

        if motivo == 'Permisos' and inicio and fin and year:
            dias_nuevos = (fin - inicio).days + 1

            permisos = Vacacion.objects.filter(
                user=user,
                motivo='Permisos',
                year=year
            )
            dias_existentes = sum([(p.fin - p.inicio).days + 1 for p in permisos])

            print(f"DEBUG permisos año {year}: {[ (p.inicio, p.fin) for p in permisos ]}")
            print(f"DEBUG días existentes: {dias_existentes}, días nuevos: {dias_nuevos}")

            if dias_existentes + dias_nuevos > 5:
                raise serializers.ValidationError(
                    {'non_field_errors': ['No se ha podido registrar por exceso de días de Permisos.']}
                )
        return data

def generar_pdf_html_vacacion(vacacion):
    # Logo de la empresa
    logo_path = os.path.join(settings.BASE_DIR, 'base', 'static', 'images', 'logo-firma.jpg')
    with open(logo_path, 'rb') as f:
        logo_b64 = base64.b64encode(f.read()).decode()
    logo_data_uri = f"data:image/png;base64,{logo_b64}"

    # Firma fija de la empresa
    firma_emp_path = os.path.join(settings.BASE_DIR, 'base', 'static', 'images', 'fjuana.jpg')
    with open(firma_emp_path, 'rb') as f:
        emp_b64 = base64.b64encode(f.read()).decode()
    firma_emp_uri = f"data:image/jpeg;base64,{emp_b64}"

    # Firma del trabajador (si existe)
    if vacacion.firma and vacacion.firma.path:
        with open(vacacion.firma.path, 'rb') as f:
            usr_b64 = base64.b64encode(f.read()).decode()
        firma_usr_uri = f"data:image/png;base64,{usr_b64}"
    else:
        firma_usr_uri = ""

    # Renderiza el HTML con estas URIs ya embebidas
    html = render_to_string('vacacion_template.html', {
        'vacacion': vacacion,
        'logo_data_uri':      logo_data_uri,
        'firma_emp_data_uri': firma_emp_uri,
        'firma_usr_data_uri': firma_usr_uri,
    })

    buffer = BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=buffer)
    if pisa_status.err:
        raise Exception(f"Error generando PDF: {pisa_status.err}")
    buffer.seek(0)
    return buffer
