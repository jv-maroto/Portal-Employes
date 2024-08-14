from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from base.models import Profile

class Command(BaseCommand):
    help = 'Crea profiles para los usuarios que no tienen '

    def handle(self, *args, **kwargs):
        users_without_profile = User.objects.filter(profile__isnull=True)
        for user in users_without_profile:
            Profile.objects.create(user=user, first_name=user.first_name, last_name=user.last_name, dni='')
        self.stdout.write(self.style.SUCCESS(f'Se han creado profiles para {users_without_profile.count()} usuarios.'))
