import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from base.models import Profile

for user in User.objects.all():
    Profile.objects.get_or_create(
        user=user,
        defaults={
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'dni': user.username,
        }
    )
print("Perfiles creados para todos los usuarios que no tenían.")