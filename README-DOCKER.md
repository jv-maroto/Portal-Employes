# Portal Empleados - Configuración Docker

## Requisitos previos en tu máquina virtual

1. **Docker Engine** instalado
2. **Docker Compose** instalado
3. **Git** para clonar el repositorio (opcional)

## Instrucciones para despliegue en máquina virtual

### 1. Preparar el proyecto

```bash
# Si no tienes el proyecto, clónalo
git clone <tu-repositorio>
cd Portal-Employes

# O simplemente copia toda la carpeta del proyecto a tu VM
```

### 2. Construir y ejecutar con Docker Compose

```bash
# Construir las imágenes y ejecutar todos los servicios
docker-compose up --build

# Para ejecutar en segundo plano
docker-compose up --build -d
```

### 3. Configurar la base de datos (solo la primera vez)

```bash
# Ejecutar migraciones en el contenedor del backend
docker-compose exec backend python manage.py migrate

# Crear superusuario para el admin de Django
docker-compose exec backend python manage.py createsuperuser

# Recopilar archivos estáticos (si es necesario)
docker-compose exec backend python manage.py collectstatic --noinput
```

### 4. Acceder a la aplicación

- **Frontend (React)**: http://localhost
- **Backend Admin (Django)**: http://localhost/admin/
- **API Backend**: http://localhost/api/
- **Base de datos PostgreSQL**: localhost:5432

## Servicios incluidos

### Backend (Django)
- **Puerto**: 8000 (interno), accesible a través del proxy nginx
- **Base de datos**: SQLite por defecto, PostgreSQL opcional
- **Volúmenes**: 
  - `./backend/media` para archivos subidos
  - `./backend/db.sqlite3` para la base de datos

### Frontend (React + Nginx)
- **Puerto**: 80
- **Proxy reverso** configurado para el backend
- **Archivos estáticos** servidos por nginx

### Base de datos PostgreSQL (opcional)
- **Puerto**: 5432
- **Credenciales**:
  - Usuario: `portal_user`
  - Contraseña: `portal_password`
  - Base de datos: `portal_db`

## Comandos útiles

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Ejecutar comandos dentro del contenedor del backend
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Acceder al shell del contenedor
docker-compose exec backend bash
```

## Configuración de variables de entorno

Las variables principales están configuradas en `docker-compose.yml`. Si necesitas modificarlas:

```yaml
environment:
  - DEBUG=True
  - SECRET_KEY=tu-clave-secreta
  - ALLOWED_HOSTS=localhost,127.0.0.1,tu-dominio.com
  - CORS_ALLOWED_ORIGINS=http://localhost,http://tu-dominio.com
```

## Usar PostgreSQL en lugar de SQLite

1. Edita `backend/backend/settings.py` y comenta la configuración de SQLite
2. Descomenta la configuración de PostgreSQL
3. Ejecuta:
```bash
docker-compose down
docker-compose up --build
docker-compose exec backend python manage.py migrate
```

## Troubleshooting

### Error de permisos
```bash
# Dar permisos a los directorios
sudo chown -R $USER:$USER ./backend/media
sudo chown -R $USER:$USER ./backend/staticfiles
```

### Limpiar y reconstruir
```bash
# Eliminar contenedores, imágenes y volúmenes
docker-compose down -v --rmi all
docker system prune -a

# Reconstruir desde cero
docker-compose up --build
```

### Ver contenedores corriendo
```bash
docker ps
docker-compose ps
```

## Archivos Docker creados

- `backend/Dockerfile` - Imagen del backend Django
- `frontend/Dockerfile` - Imagen del frontend React con nginx
- `frontend/nginx.conf` - Configuración del proxy reverso
- `docker-compose.yml` - Orquestación de todos los servicios
- `backend/.dockerignore` - Archivos a ignorar en el backend
- `frontend/.dockerignore` - Archivos a ignorar en el frontend
- `init.sql` - Script de inicialización de PostgreSQL
- `backend/requirements-docker.txt` - Dependencias adicionales para Docker

## Notas importantes

1. **Primera ejecución**: Tarda más tiempo en construir las imágenes
2. **Datos persistentes**: La base de datos SQLite y archivos media se mantienen entre reinicios
3. **Desarrollo**: Para desarrollo, puedes montar volúmenes adicionales para hot-reload
4. **Producción**: Ajusta las variables de entorno para producción (DEBUG=False, SECRET_KEY único, etc.)

¡Tu aplicación debería estar funcionando en http://localhost después de ejecutar docker-compose up --build!