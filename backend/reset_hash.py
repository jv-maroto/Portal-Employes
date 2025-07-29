import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from base.models import Profile

# Cambia esta contraseña por una segura si lo deseas
DEFAULT_PASSWORD = "CambiaEstaContraseña123"

for user in User.objects.all():
    if user.username.lower() not in ["root", "43489013s"]:
        # Si el hash es inválido o el usuario no tiene contraseña válida, la cambiamos
        user.set_password(DEFAULT_PASSWORD)
        user.save()
        print(f"Contraseña actualizada para: {user.username}")

    # Crear Profile si no existe
    Profile.objects.get_or_create(
        user=user,
        defaults={
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'dni': user.username,
        }
    )

print("Contraseñas y perfiles actualizados para todos los usuarios (excepto root y 43489013S).")