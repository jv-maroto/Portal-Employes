#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# Crear superusuario y datos de demo (solo se ejecuta si no existen)
echo "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'Portal2024!')" | python manage.py shell
python manage.py create_demo_data
