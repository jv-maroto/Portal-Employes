# Portal Empleados 👥💼

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092e20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3+-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

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

<table align="center">
<tr>
<td>

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

</td>
<td>

### 🎨 **Frontend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| ⚛️ **React** | 18.3.1 | Framework UI |
| 🎨 **Tailwind CSS** | 3.4.1 | Estilos |
| 🧩 **shadcn/ui** | Latest | Componentes UI |
| 📍 **React Router** | 6.22.3 | Navegación |
| 🖊️ **Signature Canvas** | 1.0.6 | Firma digital |
| 📊 **Radix UI** | Latest | Componentes primitivos |

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 🐳 **DevOps & Deployment**
| Tecnología | Uso |
|------------|-----|
| 🐳 **Docker** | Containerización |
| 🐙 **Docker Compose** | Orquestación |
| 🌐 **Nginx** | Proxy reverso |
| 🚢 **Portainer** | Gestión Docker |

</td>
</tr>
</table>

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

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes

# Lanzar con Docker Compose
docker-compose up --build
```

**🌐 Accesos:**
- Frontend: http://localhost
- Django Admin: http://localhost/admin/
- API: http://localhost/api/

📋 **Para despliegue completo**: Ver [**Guía de Despliegue**](DEPLOYMENT.md)
🚢 **Para Portainer**: Ver [**Guía de Portainer**](PORTAINER-GUIDE.md)

## 📞 Soporte

¿Necesitas ayuda o tienes preguntas?

🐛 **Reportar Issues**: [GitHub Issues](https://github.com/jv-maroto/Portal-Employes/issues)

---

<div align="center">

**🚀 Portal de Empleados - Sistema de gestión empresarial**

[![GitHub stars](https://img.shields.io/github/stars/jv-maroto/Portal-Employes?style=social)](https://github.com/jv-maroto/Portal-Employes/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jv-maroto/Portal-Employes?style=social)](https://github.com/jv-maroto/Portal-Employes/network/members)

</div>