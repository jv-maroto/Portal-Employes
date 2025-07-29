# 🚀 Guía de Despliegue - Portal Empleados

## 📋 Opciones de Despliegue

- [🐳 Docker Compose](#-docker-compose-recomendado)
- [🚢 Portainer](#-portainer)
- [🛠️ Desarrollo Local](#️-desarrollo-local)

---

## 🐳 Docker Compose (Recomendado)

### **Inicio Rápido**

```bash
# 1️⃣ Clonar repositorio
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes

# 2️⃣ Lanzar con Docker Compose
docker-compose up --build

# 3️⃣ Configurar base de datos (primera vez)
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic --noinput

# 4️⃣ Acceder a la aplicación
# 🌐 Frontend: http://localhost
# 🔧 Admin: http://localhost/admin/
# 📡 API: http://localhost/api/
```

### **Script Automático**
```bash
# Usar el script de inicio automático
./start-docker.sh
```

### **Comandos Útiles**
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Limpiar y reconstruir
docker-compose down -v --rmi all
docker-compose up --build
```

---

## 🚢 Portainer

Para despliegue con Portainer, consulta la **[Guía Completa de Portainer](PORTAINER-GUIDE.md)**.

### **Resumen Rápido:**

1. **Instalar Portainer**
   ```bash
   docker volume create portainer_data
   docker run -d -p 9000:9000 --name=portainer --restart=always \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v portainer_data:/data portainer/portainer-ce:latest
   ```

2. **Crear Stack**
   - Acceder: `http://tu-servidor:9000`
   - Stacks → Add Stack → "portal-empleados"
   - Repository: `https://github.com/jv-maroto/Portal-Employes.git`

3. **Variables de Entorno**
   ```env
   DEBUG=False
   SECRET_KEY=tu-clave-super-segura
   ALLOWED_HOSTS=tu-dominio.com,localhost
   ```

4. **Deploy y Configurar**
   ```bash
   # En Portainer Console del backend
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic --noinput
   ```

---

## 🛠️ Desarrollo Local

### **Backend Django**

<details>
<summary>🔧 <strong>Configuración Backend</strong></summary>

```bash
# Navegar al backend
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic

# Ejecutar servidor de desarrollo
python manage.py runserver

# Backend disponible en: http://127.0.0.1:8000
```

**Variables de Entorno (opcional):**
```bash
# Crear archivo .env en /backend/
cp .env.example .env
# Editar valores según necesidades
```
</details>

### **Frontend React**

<details>
<summary>⚛️ <strong>Configuración Frontend</strong></summary>

```bash
# Navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm start

# Frontend disponible en: http://localhost:3000

# Construir para producción
npm run build
```

**Configuración API:**
- El frontend está configurado para usar `http://localhost:8000` como backend
- Modificar en `src/api.js` si es necesario
</details>

---

## 🐘 Base de Datos PostgreSQL (Opcional)

Por defecto, el proyecto usa SQLite. Para usar PostgreSQL:

### **1. Modificar settings.py**
```python
# En backend/backend/settings.py
# Comentar configuración SQLite y descomentar PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'portal_db'),
        'USER': os.environ.get('POSTGRES_USER', 'portal_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'portal_password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}
```

### **2. Variables de Entorno**
```env
POSTGRES_DB=portal_empleados
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=password-seguro
POSTGRES_HOST=localhost  # o 'db' para Docker
```

### **3. Instalar PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres createdb portal_empleados
sudo -u postgres createuser portal_admin -P
```

---

## 🌐 Configuración de Producción

### **Variables de Entorno Críticas**
```env
# Seguridad
DEBUG=False
SECRET_KEY=clave-super-secreta-64-caracteres-minimo
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com

# CORS
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
CORS_ALLOW_ALL_ORIGINS=False

# Base de datos
POSTGRES_PASSWORD=password-super-seguro
POSTGRES_USER=usuario_produccion

# Email
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_HOST_USER=noreply@tu-dominio.com
EMAIL_HOST_PASSWORD=password-email-seguro
```

### **Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **SSL/HTTPS con Certbot**
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo crontab -e
# Añadir: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 Troubleshooting

### **Problemas Comunes**

| Problema | Solución |
|----------|----------|
| Puerto en uso | `docker-compose down` y verificar puertos |
| Error de permisos | `sudo chown -R $USER:$USER .` |
| Base de datos no conecta | Verificar credenciales en variables de entorno |
| Frontend no carga | Verificar que backend esté ejecutándose |
| Archivos estáticos 404 | Ejecutar `collectstatic` |

### **Comandos de Diagnóstico**
```bash
# Verificar servicios Docker
docker ps

# Ver logs detallados
docker-compose logs --tail=100

# Probar conectividad
curl -I http://localhost
curl -I http://localhost:8000/admin/

# Verificar base de datos
docker-compose exec backend python manage.py dbshell

# Estado de Django
docker-compose exec backend python manage.py check
```

### **Limpiar Sistema**
```bash
# Parar todo
docker-compose down

# Limpiar volúmenes y cache
docker system prune -a --volumes

# Reconstruir desde cero
docker-compose up --build
```

---

## 📞 Soporte

¿Problemas con el despliegue?

- 🐛 **Issues**: [GitHub Issues](https://github.com/jv-maroto/Portal-Employes/issues)
- 📖 **Documentación**: Ver archivos README del proyecto
- 🚢 **Portainer**: Consultar [PORTAINER-GUIDE.md](PORTAINER-GUIDE.md)

---

**🎉 Una vez completado el despliegue, tu Portal Empleados estará funcionando con todas las funcionalidades!**