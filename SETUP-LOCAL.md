# 🏠 Setup Local para Integración con PrestaShop

## 📋 Configuración para sagreracanarias.es/trabajadores

Esta guía es específica para integrar el Portal Empleados con tu nginx existente de PrestaShop en tu máquina virtual.

### 🎯 **Arquitectura**
```
sagreracanarias.es/          → PrestaShop (existente)
sagreracanarias.es/trabajadores/  → Portal Empleados (nuevo)
```

### 🔧 **Paso 1: Configurar Nginx**

1. **Editar tu configuración nginx existente**:
```bash
sudo nano /etc/nginx/sites-available/sagreracanarias
```

2. **Añadir estas locations al server block existente**:
```nginx
# Añadir dentro del server block de sagreracanarias.es

# Portal Empleados
location /trabajadores {
    rewrite ^/trabajadores$ /trabajadores/ permanent;
}

location /trabajadores/ {
    rewrite ^/trabajadores/(.*)$ /$1 break;
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Script-Name /trabajadores;
    proxy_redirect off;
}

location /trabajadores/api/ {
    rewrite ^/trabajadores/api/(.*)$ /api/$1 break;
    proxy_pass http://localhost:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /trabajadores/admin/ {
    rewrite ^/trabajadores/admin/(.*)$ /admin/$1 break;
    proxy_pass http://localhost:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /trabajadores/static/ {
    rewrite ^/trabajadores/static/(.*)$ /static/$1 break;
    proxy_pass http://localhost:8001;
    proxy_set_header Host $host;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /trabajadores/media/ {
    rewrite ^/trabajadores/media/(.*)$ /media/$1 break;
    proxy_pass http://localhost:8001;
    proxy_set_header Host $host;
    expires 7d;
    add_header Cache-Control "public";
}
```

3. **Probar configuración y recargar**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 🐳 **Paso 2: Configurar Variables de Entorno**

1. **Copiar archivo de variables**:
```bash
cp env.local backend/.env
```

2. **Editar las credenciales**:
```bash
nano backend/.env
```

3. **Cambiar la SECRET_KEY** por una nueva:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 🚀 **Paso 3: Lanzar los Servicios**

1. **Usar el docker-compose local**:
```bash
docker-compose -f docker-compose.local.yml up -d --build
```

2. **Verificar que funciona**:
```bash
docker-compose -f docker-compose.local.yml ps
```

3. **Configurar Django (primera vez)**:
```bash
# Migraciones
docker exec portal-empleados-backend python manage.py migrate

# Crear superusuario
docker exec -it portal-empleados-backend python manage.py createsuperuser

# Recopilar archivos estáticos
docker exec portal-empleados-backend python manage.py collectstatic --noinput
```

### 🌐 **Paso 4: Verificar Funcionamiento**

**URLs de acceso**:
- **Portal Principal**: https://sagreracanarias.es/trabajadores/
- **Django Admin**: https://sagreracanarias.es/trabajadores/admin/
- **API**: https://sagreracanarias.es/trabajadores/api/

**Verificar conectividad**:
```bash
curl https://sagreracanarias.es/trabajadores/
curl https://sagreracanarias.es/trabajadores/api/
```

### 🔒 **Paso 5: Configuración de Seguridad**

1. **Verificar SSL**:
   - El nginx debe tener configurado SSL para sagreracanarias.es
   - Las mismas configuraciones se aplicarán al subpath /trabajadores

2. **Firewall**:
```bash
# Solo si es necesario abrir puertos internos
sudo ufw allow 8001/tcp  # Backend
sudo ufw allow 3001/tcp  # Frontend
```

### 📊 **Monitoreo**

**Ver logs en tiempo real**:
```bash
# Logs del backend
docker logs -f portal-empleados-backend

# Logs del frontend
docker logs -f portal-empleados-frontend

# Logs de nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Comandos útiles**:
```bash
# Reiniciar servicios
docker-compose -f docker-compose.local.yml restart

# Ver estado
docker-compose -f docker-compose.local.yml ps

# Parar servicios
docker-compose -f docker-compose.local.yml down

# Actualizar código (si cambias algo)
docker-compose -f docker-compose.local.yml up -d --build
```

### 🔧 **Troubleshooting**

#### **Error: Puerto en uso**
```bash
# Verificar qué usa el puerto
sudo netstat -tlnp | grep :8001
sudo netstat -tlnp | grep :3001

# Cambiar puertos en docker-compose.local.yml si es necesario
```

#### **Error: No se conecta al backend**
```bash
# Verificar que el backend responde
curl http://localhost:8001/api/

# Verificar configuración nginx
sudo nginx -t
```

#### **Error: CORS**
- Verificar que las URLs en CORS_ALLOWED_ORIGINS sean correctas
- Asegurarse de que HTTPS esté configurado correctamente

### 📝 **Notas Importantes**

1. **Puertos utilizados**:
   - `8001`: Backend Django
   - `3001`: Frontend React
   - `5433`: PostgreSQL (opcional)

2. **URLs internas**:
   - Backend: `http://localhost:8001`
   - Frontend: `http://localhost:3001`

3. **Datos persistentes**:
   - Base de datos: volumen `portal_db`
   - Archivos media: `./backend/media`

4. **No interferencia con PrestaShop**:
   - Usa puertos diferentes
   - Red Docker separada
   - No modifica configuración existente

### 🎉 **¡Listo!**

Después de seguir estos pasos, tendrás:
- ✅ PrestaShop funcionando en `sagreracanarias.es/`
- ✅ Portal Empleados funcionando en `sagreracanarias.es/trabajadores/`
- ✅ Ambos sistemas independientes
- ✅ SSL compartido
- ✅ Nginx único sirviendo ambos