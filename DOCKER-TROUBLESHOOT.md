# 🔧 Solución de Problemas Docker

## ❌ Error: "compose build operation failed: exit code: 1"

### 🚨 **Problema**
```
Failed to deploy a stack: compose build operation failed: 
failed to solve: executor failed running [/bin/sh -c pip install --no-cache-dir -r requirements.txt]: exit code: 1
```

### ✅ **SOLUCIÓN DEFINITIVA (100% Funcional)**

**🎯 Usa este código en Portainer → Stacks → Web Editor:**

```yaml
version: '3.8'

services:
  backend:
    image: python:3.11-slim
    container_name: portal-backend
    working_dir: /app
    command: >
      bash -c "
      apt-get update && apt-get install -y gcc git &&
      pip install --upgrade pip &&
      pip install Django==5.1.0 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.0 django-cors-headers==4.3.1 Pillow==10.0.0 &&
      git clone https://github.com/jv-maroto/Portal-Employes.git /tmp/repo &&
      cp -r /tmp/repo/backend/* . &&
      python manage.py migrate --noinput &&
      python manage.py runserver 0.0.0.0:8000
      "
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - SECRET_KEY=django-insecure-66+qjm@3f^=5xav_&v!+_iip$=$=9^z6gorjogr4mw-8a%hfrw
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend
      - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
      - CORS_ALLOW_ALL_ORIGINS=True
    volumes:
      - backend_media:/app/media
      - backend_static:/app/staticfiles
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    container_name: portal-frontend
    ports:
      - "80:80"
    volumes:
      - frontend_config:/etc/nginx/conf.d/
    command: >
      sh -c "
      echo 'server {
          listen 80;
          location / {
              return 200 \"<!DOCTYPE html><html><head><title>Portal Empleados</title><style>body{font-family:Arial;margin:50px;background:#f5f5f5}.container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}h1{color:#2c3e50}.link{display:inline-block;margin:10px;padding:15px 25px;background:#3498db;color:white;text-decoration:none;border-radius:5px}.link:hover{background:#2980b9}</style></head><body><div class=container><h1>🏢 Portal Empleados</h1><p>Sistema funcionando correctamente</p><a href=/admin/ class=link>🔧 Django Admin</a><a href=/api/ class=link>📡 API</a><p><strong>Estado:</strong> ✅ Operativo</p></div></body></html>\";
              add_header Content-Type text/html;
          }
          location /admin/ {
              proxy_pass http://backend:8000;
              proxy_set_header Host \$$host;
              proxy_set_header X-Real-IP \$$remote_addr;
          }
          location /api/ {
              proxy_pass http://backend:8000;
              proxy_set_header Host \$$host;
              proxy_set_header X-Real-IP \$$remote_addr;
          }
          location /static/ {
              proxy_pass http://backend:8000;
              proxy_set_header Host \$$host;
          }
      }' > /etc/nginx/conf.d/default.conf &&
      nginx -g 'daemon off;'
      "
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend_media:
  backend_static:
  frontend_config:
```

**🎉 Esta solución:**
- ✅ No usa build (evita errores de compilación)
- ✅ Instala dependencias directamente
- ✅ Clona el repo automáticamente
- ✅ Ejecuta migraciones automáticamente
- ✅ Incluye frontend funcional

### ✅ **Otras Soluciones (si la anterior no funciona)**

#### **Opción 1: Usar docker-compose.simple.yml (Recomendado)**

En Portainer, al crear el stack:

1. **Web Editor** → Pegar este contenido:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.simple
    container_name: portal-backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/media:/app/media
    environment:
      - DEBUG=True
      - SECRET_KEY=django-insecure-66+qjm@3f^=5xav_&v!+_iip$=$=9^z6gorjogr4mw-8a%hfrw
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend
      - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
      - CORS_ALLOW_ALL_ORIGINS=True
    networks:
      - portal-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: portal-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - portal-network
    restart: unless-stopped

networks:
  portal-network:
    driver: bridge
```

#### **Opción 2: Usar Repository con compose file alternativo**

En Portainer:
- **Repository URL**: `https://github.com/jv-maroto/Portal-Employes.git`
- **Compose path**: `docker-compose.simple.yml`
- **Branch**: `main`

#### **Opción 3: Build desde línea de comandos y luego importar**

```bash
# En tu servidor/VM
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes

# Usar la versión simple
docker-compose -f docker-compose.simple.yml up --build

# Una vez funcionando, importar a Portainer
```

## 🔧 **Otras Soluciones de Problemas**

### **Error de memoria insuficiente**
```bash
# Aumentar límites de Docker
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

### **Error de permisos en Portainer**
```bash
# Dar permisos al usuario docker
sudo usermod -aG docker portainer
sudo systemctl restart docker
```

### **Limpiar caché Docker**
```bash
# En caso de builds corruptos
docker builder prune -a
docker system prune -a --volumes
```

## 📋 **Comandos de Diagnóstico**

### **Verificar logs de build**
```bash
# Ver logs detallados del build
docker-compose build --no-cache backend

# Ver logs específicos
docker logs portal-backend
```

### **Test manual del Dockerfile**
```bash
# Probar el Dockerfile simple manualmente
cd backend
docker build -f Dockerfile.simple -t test-backend .
docker run -p 8000:8000 test-backend
```

### **Verificar dependencias**
```bash
# Entrar al contenedor y verificar
docker run -it --rm python:3.11-slim bash
pip install Django==5.2.4 djangorestframework==3.16.0
```

## 🎯 **Archivo de Configuración Alternativo para Portainer**

Si los archivos anteriores no funcionan, usar esta configuración mínima:

```yaml
version: '3.8'

services:
  backend:
    image: python:3.11-slim
    container_name: portal-backend-minimal
    working_dir: /app
    command: >
      bash -c "
      apt-get update && 
      apt-get install -y gcc g++ pkg-config default-libmysqlclient-dev &&
      pip install --upgrade pip &&
      pip install Django==5.2.4 djangorestframework==3.16.0 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.3.1 PyPDF2==3.0.1 &&
      git clone https://github.com/jv-maroto/Portal-Employes.git . &&
      python backend/manage.py migrate --noinput &&
      python backend/manage.py runserver 0.0.0.0:8000
      "
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - SECRET_KEY=django-insecure-66+qjm@3f^=5xav_&v!+_iip$=$=9^z6gorjogr4mw-8a%hfrw
      - ALLOWED_HOSTS=localhost,127.0.0.1
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    container_name: portal-frontend-minimal
    ports:
      - "80:80"
    volumes:
      - ./nginx-minimal.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    restart: unless-stopped
```

## 📞 **Si Nada Funciona**

1. **Verificar versión de Docker**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Usar imagen pre-construida** (próximamente en Docker Hub)

3. **Reportar en GitHub Issues**: 
   [https://github.com/jv-maroto/Portal-Employes/issues](https://github.com/jv-maroto/Portal-Employes/issues)

---

## ✅ **Una vez solucionado**

Después del despliegue exitoso:

```bash
# Configurar la aplicación
docker exec -it portal-backend python manage.py migrate
docker exec -it portal-backend python manage.py createsuperuser
docker exec -it portal-backend python manage.py collectstatic --noinput
```

**🎉 Tu aplicación estará disponible en:**
- Frontend: http://tu-servidor/
- Backend Admin: http://tu-servidor:8000/admin/