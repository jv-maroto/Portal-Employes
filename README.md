# Portal Empleados 👥💼

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092e20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3+-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Sistema integral de gestión empresarial** para empleados con dashboard moderno, gestión de nóminas, vacaciones y comunicados internos.

</div>

## 🚀 Características Principales

### 📊 **Dashboard Interactivo**
- Panel de control personalizado por empleado
- Resumen de nóminas recientes
- Estado de vacaciones y permisos
- Comunicados importantes destacados

### 💰 **Gestión de Nóminas**
- Visualización de nóminas por período
- Descarga de documentos PDF
- Historial completo de pagos
- Filtros por fecha y estado

### 🏖️ **Sistema de Vacaciones**
- Solicitud de vacaciones con formulario interactivo
- Calendario visual de disponibilidad
- Gestión de permisos especiales
- Firma digital integrada

### 📢 **Comunicados Empresariales**
- Sistema de anuncios por departamento
- Comunicados con descarga restringida
- Editor de contenido enriquecido
- Gestión por roles de administrador

## 🛠️ Stack Tecnológico

<div align="center">

### 🔧 **Backend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| 🐍 **Python** | 3.11+ | Lenguaje principal |
| 🎯 **Django** | 5.0.3 | Framework web |
| 🔐 **Django REST Framework** | 3.15.2 | API REST |
| 🔑 **JWT** | Simple JWT | Autenticación |
| 📄 **PyPDF2** | 3.0.1 | Procesamiento PDFs |
| 🐘 **PostgreSQL** | 13+ | Base de datos (opcional) |
| 📁 **SQLite** | - | Base de datos por defecto |

### 🎨 **Frontend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| ⚛️ **React** | 18.3.1 | Framework UI |
| 🎨 **Tailwind CSS** | 3.4.1 | Estilos |
| 🧩 **shadcn/ui** | Latest | Componentes UI |
| 📍 **React Router** | 6.22.3 | Navegación |
| 🖊️ **Signature Canvas** | 1.0.6 | Firma digital |
| 📊 **Radix UI** | Latest | Componentes primitivos |

### 🐳 **DevOps & Deployment**
| Tecnología | Uso |
|------------|-----|
| 🐳 **Docker** | Containerización |
| 🐙 **Docker Compose** | Orquestación |
| 🌐 **Nginx** | Proxy reverso |
| 🚢 **Portainer** | Gestión Docker |

</div>

## 📁 Estructura del Proyecto

```
Portal-Employes/
├── 🐳 docker-compose.yml          # Orquestación de servicios
├── 📚 README-DOCKER.md            # Documentación Docker
├── 🚀 start-docker.sh             # Script de inicio automático
├── 🗄️ init.sql                    # Inicialización BD PostgreSQL
│
├── 🔧 backend/                     # Aplicación Django
│   ├── 🐳 Dockerfile              # Imagen Docker backend
│   ├── 📋 requirements.txt        # Dependencias Python
│   ├── 📋 requirements-docker.txt # Dependencias Docker
│   ├── ⚙️ backend/
│   │   ├── 🔧 settings.py         # Configuración Django
│   │   ├── 🌐 urls.py             # URLs principales
│   │   └── 🔐 wsgi.py             # WSGI application
│   ├── 📦 base/                   # App principal
│   │   ├── 🗃️ models.py           # Modelos de datos
│   │   ├── 👁️ views.py            # Vistas Django
│   │   ├── 🔄 serializer.py       # Serializadores DRF
│   │   ├── 🛡️ admin.py            # Panel administración
│   │   ├── 🗂️ migrations/         # Migraciones BD
│   │   └── 🌐 api/
│   │       ├── 📍 urls.py         # URLs API
│   │       └── 👁️ views.py        # Vistas API
│   └── 📁 staticfiles/            # Archivos estáticos
│
├── 🎨 frontend/                   # Aplicación React
│   ├── 🐳 Dockerfile             # Imagen Docker frontend
│   ├── 🌐 nginx.conf             # Configuración Nginx
│   ├── 📋 package.json           # Dependencias Node.js
│   ├── 🎨 tailwind.config.js     # Configuración Tailwind
│   ├── 🔧 config-overrides.js    # Override CRA
│   └── 📂 src/
│       ├── 📱 App.js             # Componente principal
│       ├── 📄 pages/             # Páginas principales
│       │   ├── 🏠 Dashboard.js   # Panel principal
│       │   ├── 💰 Nominas.js     # Gestión nóminas
│       │   ├── 🏖️ Vacaciones.js  # Gestión vacaciones
│       │   ├── 📢 Comunicados.js # Comunicados
│       │   └── 🔐 LoginPage.js   # Autenticación
│       ├── 🧩 components/        # Componentes reutilizables
│       │   ├── 🎨 ui/            # Componentes UI base
│       │   ├── 🔐 auth/          # Componentes autenticación
│       │   ├── 📊 vacations/     # Componentes vacaciones
│       │   └── 📢 comunicados/   # Componentes comunicados
│       ├── 🌐 contexts/          # Context API React
│       └── 🔧 lib/               # Utilidades
│
└── 📋 CLAUDE.md                   # Documentación Claude Code
```

## 🏃‍♂️ Inicio Rápido

### 🐳 **Con Docker (Recomendado)**

```bash
# 1️⃣ Clonar repositorio
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes

# 2️⃣ Lanzar con Docker Compose
docker-compose up --build

# 3️⃣ Acceder a la aplicación
# 🌐 Frontend: http://localhost
# 🔧 Admin: http://localhost/admin/
# 📡 API: http://localhost/api/
```

### 🛠️ **Desarrollo Local**

<details>
<summary>🔧 <strong>Backend Django</strong></summary>

```bash
# Instalar dependencias
cd backend
pip install -r requirements.txt

# Configurar base de datos
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic

# Ejecutar servidor
python manage.py runserver
```
</details>

<details>
<summary>⚛️ <strong>Frontend React</strong></summary>

```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar servidor desarrollo
npm start

# Construir para producción
npm run build
```
</details>

## 🚢 Despliegue con Portainer

### 📋 **Requisitos Previos**
- ✅ Docker Engine instalado
- ✅ Portainer CE/EE instalado
- ✅ Acceso a interfaz web de Portainer

### 🎯 **Pasos de Despliegue**

#### 1️⃣ **Preparar el Proyecto**
```bash
# En tu máquina virtual/servidor
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes
```

#### 2️⃣ **Configurar en Portainer**

1. **Acceder a Portainer**
   - 🌐 Abrir navegador: `http://tu-servidor:9000`
   - 🔐 Iniciar sesión con credenciales admin

2. **Crear Stack**
   - 📚 Ir a **"Stacks"** → **"Add Stack"**
   - 📝 Nombre: `portal-empleados`
   - 📁 Método: **"Upload"** o **"Repository"**

3. **Opción A: Upload docker-compose.yml**
   ```bash
   # Subir archivo docker-compose.yml desde el proyecto
   ```

4. **Opción B: Git Repository**
   ```
   Repository URL: https://github.com/jv-maroto/Portal-Employes.git
   Compose path: docker-compose.yml
   Branch: main
   ```

#### 3️⃣ **Variables de Entorno**
```env
# En la sección "Environment variables"
DEBUG=False
SECRET_KEY=tu-clave-secreta-super-segura
ALLOWED_HOSTS=tu-dominio.com,localhost
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
EMAIL_HOST=tu-servidor-smtp.com
EMAIL_HOST_USER=tu-email@dominio.com
EMAIL_HOST_PASSWORD=tu-password-email
```

#### 4️⃣ **Desplegar Stack**
- ✅ Click en **"Deploy the stack"**
- ⏳ Esperar a que se construyan las imágenes
- 🎉 Verificar que todos los servicios estén **"Running"**

#### 5️⃣ **Configuración Post-Despliegue**
```bash
# Ejecutar migraciones (en Portainer → Containers → backend → Console)
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### 6️⃣ **Configurar Reverse Proxy (Opcional)**
<details>
<summary>🌐 <strong>Nginx/Traefik Setup</strong></summary>

```nginx
# /etc/nginx/sites-available/portal-empleados
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
</details>

### 🔍 **Monitoreo en Portainer**

#### 📊 **Dashboard de Servicios**
- 🟢 **backend**: Puerto 8000 (interno)
- 🟢 **frontend**: Puerto 80 (externo)
- 🟢 **db**: Puerto 5432 (interno)

#### 📋 **Logs y Debugging**
```bash
# Ver logs en tiempo real
Portainer → Containers → [servicio] → Logs

# Acceder a consola del contenedor
Portainer → Containers → [servicio] → Console
```

#### 🔄 **Actualizaciones**
1. 🐙 **Git Pull**: Update stack desde repositorio
2. 🔄 **Recreate**: Recrear contenedores con nuevas imágenes
3. ✅ **Deploy**: Aplicar cambios

### ⚠️ **Troubleshooting Portainer**

<details>
<summary>❌ <strong>Problemas Comunes</strong></summary>

| Problema | Solución |
|----------|----------|
| 🔴 Contenedor no inicia | Verificar logs en Portainer |
| 🌐 No accesible desde exterior | Revisar configuración de puertos |
| 🗄️ Error de base de datos | Verificar volúmenes persistentes |
| 🔐 Error de permisos | Ajustar ownership de volúmenes |
| 💾 Falta espacio | Limpiar imágenes no utilizadas |

```bash
# Comandos útiles desde Portainer Console
docker system prune -a    # Limpiar sistema
docker volume ls          # Listar volúmenes
docker logs container_id  # Ver logs específicos
```
</details>

## 🔐 Configuración de Seguridad

### 🛡️ **Variables de Entorno Críticas**
```env
# 🔑 Django
SECRET_KEY=clave-super-secreta-64-caracteres-minimo
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com

# 🗄️ Base de Datos
POSTGRES_PASSWORD=password-super-seguro
POSTGRES_USER=portal_user_prod

# 📧 Email
EMAIL_HOST_PASSWORD=password-email-seguro
```

### 🔒 **Mejores Prácticas**
- ✅ Usar HTTPS en producción
- ✅ Configurar firewall apropiado
- ✅ Backups regulares de la base de datos
- ✅ Monitoreo de logs de seguridad
- ✅ Actualizaciones regulares de dependencias

## 🤝 Contribuir

1. 🍴 Fork el proyecto
2. 🌿 Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push al branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abrir Pull Request

## 📋 Roadmap

- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔔 Sistema de notificaciones push
- [ ] 📊 Dashboard analytics avanzado
- [ ] 🌍 Multiidioma (i18n)
- [ ] 📱 App móvil React Native
- [ ] 🤖 API GraphQL
- [ ] 🔍 Búsqueda avanzada
- [ ] 📈 Reportes automáticos

## 📞 Soporte

¿Necesitas ayuda? 

- 📧 **Email**: soporte@portal-empleados.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/jv-maroto/Portal-Employes/issues)
- 📖 **Documentación**: [Wiki del Proyecto](https://github.com/jv-maroto/Portal-Employes/wiki)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**🚀 Hecho con ❤️ para mejorar la gestión empresarial**

[![GitHub stars](https://img.shields.io/github/stars/jv-maroto/Portal-Employes?style=social)](https://github.com/jv-maroto/Portal-Employes/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jv-maroto/Portal-Employes?style=social)](https://github.com/jv-maroto/Portal-Employes/network/members)

</div>