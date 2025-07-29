# 🚢 Guía Completa de Despliegue con Portainer

## 📋 Tabla de Contenidos
- [Preparación del Entorno](#-preparación-del-entorno)
- [Instalación de Portainer](#-instalación-de-portainer)
- [Configuración del Stack](#-configuración-del-stack)
- [Despliegue Paso a Paso](#-despliegue-paso-a-paso)
- [Configuración Post-Despliegue](#-configuración-post-despliegue)
- [Monitoreo y Mantenimiento](#-monitoreo-y-mantenimiento)
- [Troubleshooting](#-troubleshooting)

## 🛠️ Preparación del Entorno

### 1️⃣ **Instalar Docker en tu VM**

#### **Ubuntu/Debian:**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

#### **CentOS/RHEL:**
```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Añadir usuario al grupo
sudo usermod -aG docker $USER
```

### 2️⃣ **Configurar Firewall**
```bash
# Abrir puertos necesarios
sudo ufw allow 9000/tcp  # Portainer
sudo ufw allow 80/tcp   # Frontend
sudo ufw allow 443/tcp  # HTTPS (opcional)
sudo ufw allow 8000/tcp # Backend (para debugging)

# Verificar reglas
sudo ufw status
```

## 🚢 Instalación de Portainer

### **Opción 1: Portainer CE (Community Edition)**
```bash
# Crear volumen para datos de Portainer
docker volume create portainer_data

# Ejecutar Portainer
docker run -d -p 8000:8000 -p 9000:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### **Opción 2: Con Docker Compose**
```yaml
# portainer-docker-compose.yml
version: '3.8'
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    
volumes:
  portainer_data:
```

```bash
# Ejecutar
docker-compose -f portainer-docker-compose.yml up -d
```

### 3️⃣ **Configuración Inicial de Portainer**

1. **Acceder a Portainer**
   ```
   http://tu-ip-servidor:9000
   ```

2. **Crear Usuario Admin**
   - Username: `admin`
   - Password: `mínimo-12-caracteres-seguros`

3. **Conectar Docker Environment**
   - Seleccionar **"Docker"**
   - Usar **"Docker Socket"** (ya configurado)

## 🎯 Configuración del Stack

### 1️⃣ **Preparar el Proyecto**

#### **En tu Servidor/VM:**
```bash
# Clonar el repositorio
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes

# Verificar archivos Docker
ls -la
# Deberías ver: docker-compose.yml, start-docker.sh, etc.
```

### 2️⃣ **Preparar Variables de Entorno**

#### **Crear archivo .env (opcional pero recomendado):**
```bash
# Crear archivo de variables
nano .env
```

```env
# .env - Variables de Producción
DEBUG=False
SECRET_KEY=django-super-secret-key-production-64-chars-minimum-security
ALLOWED_HOSTS=tu-dominio.com,localhost,127.0.0.1

# Base de datos
POSTGRES_DB=portal_empleados_prod
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=password-super-seguro-bd-2024

# CORS
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,http://localhost
CORS_ALLOW_ALL_ORIGINS=False

# Email
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@tu-dominio.com
EMAIL_HOST_PASSWORD=password-email-seguro
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

## 🚀 Despliegue Paso a Paso

### **Paso 1: Crear Stack en Portainer**

1. **Acceder a Portainer**
   - URL: `http://tu-servidor:9000`
   - Login con credenciales admin

2. **Navegar a Stacks**
   ```
   Portainer Dashboard → Stacks → Add stack
   ```

3. **Configurar el Stack**
   - **Name**: `portal-empleados`
   - **Build method**: Elegir una opción:

#### **Opción A: Repository (Recomendado)**
```
Git repository URL: https://github.com/jv-maroto/Portal-Employes.git
Repository reference: refs/heads/main
Compose path: docker-compose.yml
```

#### **Opción B: Upload**
- Subir el archivo `docker-compose.yml` local

#### **Opción C: Web editor**
- Copiar y pegar el contenido de `docker-compose.yml`

### **Paso 2: Configurar Variables de Entorno**

En la sección **"Environment variables"**:

```env
DEBUG=False
SECRET_KEY=tu-clave-secreta-super-segura-64-caracteres
ALLOWED_HOSTS=tu-dominio.com,localhost,127.0.0.1
POSTGRES_DB=portal_empleados_prod
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=password-bd-super-seguro
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_HOST_USER=noreply@tu-dominio.com
EMAIL_HOST_PASSWORD=password-email-seguro
```

### **Paso 3: Desplegar**

1. **Deploy Stack**
   - ✅ Click **"Deploy the stack"**
   - ⏳ Esperar a que se construyan las imágenes (5-10 minutos)

2. **Verificar Estado**
   ```
   Portainer → Stacks → portal-empleados
   ```
   - ✅ **backend**: Status "running"
   - ✅ **frontend**: Status "running"  
   - ✅ **db**: Status "running"

## ⚙️ Configuración Post-Despliegue

### **1️⃣ Configurar Base de Datos**

#### **Acceder al Contenedor Backend:**
```
Portainer → Containers → portal-empleados_backend_1 → Console
```

#### **Ejecutar Comandos:**
```bash
# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
# Username: admin
# Email: admin@tu-dominio.com
# Password: password-admin-seguro

# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Verificar configuración
python manage.py check
```

### **2️⃣ Verificar Servicios**

#### **Probar Conectividad:**
```bash
# Probar backend
curl http://tu-servidor:8000/admin/

# Probar frontend
curl http://tu-servidor/

# Probar API
curl http://tu-servidor/api/
```

### **3️⃣ Configurar Nginx Reverse Proxy (Opcional)**

#### **Instalar Nginx:**
```bash
sudo apt install nginx -y
```

#### **Configurar Virtual Host:**
```bash
sudo nano /etc/nginx/sites-available/portal-empleados
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirigir a HTTPS (opcional)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Websockets support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Backend directo (para debugging)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **Activar Configuración:**
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/portal-empleados /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

## 📊 Monitoreo y Mantenimiento

### **1️⃣ Dashboard de Monitoreo**

#### **En Portainer:**
```
Dashboard → Containers
```

**Métricas importantes:**
- 🟢 **Status**: Todos running
- 📊 **CPU Usage**: < 80%
- 💾 **Memory Usage**: < 80%
- 🌐 **Network**: Traffic normal

### **2️⃣ Logs en Tiempo Real**

#### **Ver Logs:**
```
Portainer → Containers → [servicio] → Logs
```

#### **Logs Importantes:**
- **Backend**: Errores Django, requests API
- **Frontend**: Errores nginx, accesos
- **DB**: Conexiones, queries lentas

### **3️⃣ Comandos de Mantenimiento**

#### **Desde Portainer Console:**
```bash
# Limpiar sistema Docker
docker system prune -a

# Ver espacio usado
docker system df

# Backup base de datos
docker exec portal-empleados_db_1 pg_dump -U portal_admin portal_empleados_prod > backup.sql

# Logs específicos
docker logs portal-empleados_backend_1 --tail=100
```

### **4️⃣ Actualizaciones**

#### **Actualizar Stack:**
1. **Git Pull**:
   ```
   Portainer → Stacks → portal-empleados → Editor
   ```
   - Activar **"Pull and redeploy"**

2. **Recrear Contenedores**:
   ```
   Portainer → Stacks → portal-empleados
   ```
   - ✅ **"Prune unused resources"**
   - ✅ **"Re-pull image and redeploy"**

## 🔧 Troubleshooting

### **❌ Problemas Comunes**

#### **1. Contenedor no inicia**
```bash
# Ver logs detallados
Portainer → Containers → [servicio] → Logs

# Comandos útiles
docker ps -a
docker logs container_name --tail=50
```

**Soluciones:**
- Verificar variables de entorno
- Comprobar puertos en uso
- Revisar permisos de volúmenes

#### **2. Error de conexión a BD**
```bash
# Verificar contenedor BD
docker exec -it portal-empleados_db_1 psql -U portal_admin -d portal_empleados_prod

# Test de conectividad
docker exec portal-empleados_backend_1 python manage.py dbshell
```

**Soluciones:**
- Verificar credenciales BD
- Comprobar networking entre contenedores
- Reiniciar contenedor BD

#### **3. Frontend no accesible**
```bash
# Verificar nginx logs
docker logs portal-empleados_frontend_1

# Test directo
curl -I http://localhost:80
```

**Soluciones:**
- Verificar configuración nginx
- Comprobar build de React
- Revisar proxy_pass configuración

#### **4. Error de permisos**
```bash
# Verificar ownership
docker exec portal-empleados_backend_1 ls -la /app/

# Ajustar permisos
docker exec portal-empleados_backend_1 chown -R www-data:www-data /app/media/
```

### **🚨 Comandos de Emergencia**

```bash
# Parar todos los contenedores
docker stop $(docker ps -q)

# Reiniciar stack completo
docker-compose down && docker-compose up -d

# Limpiar todo y empezar de cero
docker system prune -a --volumes
```

### **📞 Puntos de Verificación**

| Servicio | URL | Estado Esperado |
|----------|-----|-----------------|
| 🌐 Frontend | `http://tu-servidor/` | Login page |
| 🔧 Django Admin | `http://tu-servidor/admin/` | Admin login |
| 📡 API | `http://tu-servidor/api/` | API root |
| 🚢 Portainer | `http://tu-servidor:9000` | Dashboard |
| 🗄️ PostgreSQL | `tu-servidor:5432` | Connection OK |

### **📋 Checklist de Despliegue**

- [ ] ✅ Docker instalado y funcionando
- [ ] ✅ Portainer instalado y accesible
- [ ] ✅ Repositorio clonado correctamente
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Stack desplegado sin errores
- [ ] ✅ Migraciones ejecutadas
- [ ] ✅ Superusuario creado
- [ ] ✅ Frontend accesible
- [ ] ✅ API respondiendo
- [ ] ✅ Django admin funcionando
- [ ] ✅ Base de datos conectada
- [ ] ✅ Logs sin errores críticos

---

## 🎉 ¡Despliegue Completado!

Tu Portal Empleados debería estar funcionando en:
- **🌐 Aplicación**: `http://tu-servidor/`
- **🛡️ Admin**: `http://tu-servidor/admin/`
- **🚢 Portainer**: `http://tu-servidor:9000`

¿Problemas? Revisa la sección de troubleshooting o consulta los logs en Portainer.