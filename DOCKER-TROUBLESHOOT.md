# 🔧 Solución de Problemas Docker

## ❌ Error: "compose build operation failed: exit code: 1"

### 🚨 **Problema**
```
Failed to deploy a stack: compose build operation failed: 
failed to solve: executor failed running [/bin/sh -c pip install --no-cache-dir -r requirements-docker.txt]: exit code: 1
```

### ✅ **Soluciones Disponibles**

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