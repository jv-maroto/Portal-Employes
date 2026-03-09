from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from base.models import Profile, Post, PostView, Vacacion
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Crea datos de demostración para el portal'

    def handle(self, *args, **options):
        # No duplicar si ya hay datos
        if Post.objects.exists():
            self.stdout.write(self.style.WARNING('Ya existen datos de demo. Saltando.'))
            return

        # Crear usuario admin si no existe
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'is_superuser': True, 'is_staff': True}
        )

        # Crear usuario demo (empleado)
        demo, created = User.objects.get_or_create(
            username='12345678Z',
            defaults={
                'email': 'empleado@example.com',
                'first_name': 'Juan',
                'last_name': 'García López',
            }
        )
        if created:
            demo.set_password('Demo2024!')
            demo.save()

        # Crear perfil para el empleado demo
        Profile.objects.get_or_create(
            user=demo,
            defaults={
                'first_name': 'Juan',
                'last_name': 'García López',
                'dni': '12345678Z',
            }
        )

        # Crear perfil para admin
        Profile.objects.get_or_create(
            user=admin,
            defaults={
                'first_name': 'Administrador',
                'last_name': 'Sistema',
                'dni': '00000000A',
            }
        )

        # --- COMUNICADOS ---
        posts_data = [
            {
                'title': 'Actualización de la Política de Teletrabajo 2026',
                'summary': 'Se amplían los días de teletrabajo a 3 días por semana para todos los departamentos.',
                'content': '''<h2>Nueva Política de Teletrabajo</h2>
<p>Estimados compañeros,</p>
<p>Nos complace informaros de que, a partir del <strong>1 de abril de 2026</strong>, se amplía la política de teletrabajo:</p>
<ul>
<li>Todos los empleados podrán teletrabajar <strong>3 días por semana</strong></li>
<li>Los días presenciales serán martes y jueves</li>
<li>Se proporcionará un bono de 50€/mes para gastos de oficina en casa</li>
</ul>
<p>Para más información, contactad con Recursos Humanos.</p>''',
                'department': 'RRHH',
            },
            {
                'title': 'Nuevo Sistema de Fichaje Digital',
                'summary': 'A partir de marzo se implementa el nuevo sistema de control horario mediante app móvil.',
                'content': '''<h2>Sistema de Fichaje Digital</h2>
<p>Informamos de la puesta en marcha del nuevo sistema de fichaje:</p>
<ul>
<li>Descarga la app <strong>Portal Empleados</strong> en tu móvil</li>
<li>Ficha entrada y salida con un solo clic</li>
<li>Consulta tu historial de horas en tiempo real</li>
<li>Solicita correcciones directamente desde la app</li>
</ul>
<p>La formación se realizará la semana del 10 al 14 de marzo.</p>''',
                'department': 'IT',
            },
            {
                'title': 'Resultados Financieros Q4 2025',
                'summary': 'La empresa cierra el cuarto trimestre con un crecimiento del 15% respecto al año anterior.',
                'content': '''<h2>Resultados Q4 2025</h2>
<p>Nos alegra compartir los resultados del último trimestre:</p>
<ul>
<li>Ingresos: <strong>+15%</strong> vs Q4 2024</li>
<li>Nuevos clientes: <strong>23</strong> contratos firmados</li>
<li>Satisfacción del cliente: <strong>4.8/5</strong></li>
<li>Índice de retención de empleados: <strong>96%</strong></li>
</ul>
<p>¡Gracias a todos por vuestro esfuerzo!</p>''',
                'department': 'FIN',
            },
            {
                'title': 'Evento Team Building - Primavera 2026',
                'summary': 'Jornada de actividades al aire libre el 25 de abril. ¡Apúntate!',
                'content': '''<h2>Team Building Primavera 2026</h2>
<p>Este año organizamos una jornada especial:</p>
<ul>
<li><strong>Fecha:</strong> 25 de abril de 2026</li>
<li><strong>Lugar:</strong> Parque Natural Sierra de Guadarrama</li>
<li><strong>Actividades:</strong> Senderismo, talleres, comida al aire libre</li>
<li><strong>Transporte:</strong> Autobús desde la oficina a las 9:00h</li>
</ul>
<p>Confirma tu asistencia antes del 15 de abril a través de RRHH.</p>''',
                'department': 'RRHH',
            },
        ]

        for i, post_data in enumerate(posts_data):
            post = Post.objects.create(**post_data)
            # Marcar algunos como vistos por el usuario demo
            if i < 2:
                PostView.objects.create(post=post, user=demo)

        # --- VACACIONES ---
        vacaciones_data = [
            {
                'user': demo,
                'year': 2026,
                'month': 'Marzo',
                'motivo': 'Vacaciones',
                'inicio': date(2026, 3, 16),
                'fin': date(2026, 3, 20),
                'email': 'empleado@example.com',
            },
            {
                'user': demo,
                'year': 2026,
                'month': 'Enero',
                'motivo': 'Días Libres',
                'inicio': date(2026, 1, 6),
                'fin': date(2026, 1, 7),
                'email': 'empleado@example.com',
            },
            {
                'user': demo,
                'year': 2025,
                'month': 'Diciembre',
                'motivo': 'Vacaciones',
                'inicio': date(2025, 12, 23),
                'fin': date(2025, 12, 31),
                'email': 'empleado@example.com',
            },
            {
                'user': demo,
                'year': 2026,
                'month': 'Febrero',
                'motivo': 'Permisos',
                'inicio': date(2026, 2, 10),
                'fin': date(2026, 2, 10),
                'email': 'empleado@example.com',
            },
        ]

        for vac_data in vacaciones_data:
            Vacacion.objects.create(**vac_data)

        self.stdout.write(self.style.SUCCESS(
            'Datos de demo creados:\n'
            '  - Usuario demo: 12345678Z / Demo2024!\n'
            '  - 4 comunicados\n'
            '  - 4 solicitudes de vacaciones\n'
            '  - Perfiles creados'
        ))
