# Portal Corp — Portal de Empleados

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092e20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3+-61dafb?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Sistema integral de gestion empresarial para empleados. Dashboard centralizado, gestion de nominas, solicitud de vacaciones y comunicados internos.

</div>

---

## Capturas de pantalla

<div align="center">

### Modo oscuro
<img src="docs/screenshots/dashboard-dark.png" alt="Dashboard - Modo oscuro" width="100%">

### Modo claro
<img src="docs/screenshots/dashboard-light.png" alt="Dashboard - Modo claro" width="100%">

<details>
<summary><strong>Ver mas capturas</strong></summary>

#### Nominas
<img src="docs/screenshots/nominas.png" alt="Gestion de Nominas" width="100%">

#### Vacaciones
<img src="docs/screenshots/vacaciones.png" alt="Gestion de Vacaciones" width="100%">

#### Comunicados
<img src="docs/screenshots/comunicados.png" alt="Comunicados Empresariales" width="100%">

</details>

</div>

---

## Funcionalidades

| Modulo | Descripcion |
|---|---|
| **Dashboard** | Panel centralizado con resumen de ausencias, calendario interactivo con eventos, ultimas nominas y comunicados recientes |
| **Nominas** | Consulta y descarga de nominas en PDF, organizadas por mes y ano con selector de periodo |
| **Vacaciones** | Solicitud de vacaciones, dias libres y permisos con calendario visual, resumen de dias disponibles y seguimiento de estado |
| **Comunicados** | Listado de comunicados internos por departamento con filtros, paginacion y descarga de documentos adjuntos |
| **Administracion** | Tabla de gestion de ausencias del personal con busqueda, filtros por tipo y ordenacion por columnas |
| **Modo oscuro** | Toggle de tema claro/oscuro con persistencia en localStorage y deteccion automatica del sistema |

---

## Arquitectura

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│   Browser   │◄─────►│     Nginx       │       │  PostgreSQL  │
│  React SPA  │       │  Reverse Proxy  │       │  (produccion)│
└─────────────┘       └────────┬────────┘       └──────▲───────┘
                               │                       │
                      ┌────────▼────────┐              │
                      │  Django + DRF   │──────────────┘
                      │   API REST      │
                      │  JWT Auth       │
                      └─────────────────┘
```

- **Frontend**: React SPA que consume la API REST via Axios con interceptores JWT
- **Nginx**: Sirve el build estatico de React y hace proxy inverso a Django (`/api/`, `/admin/`)
- **Backend**: Django REST Framework con autenticacion JWT, procesamiento de PDFs y gestion de archivos
- **Base de datos**: SQLite3 en desarrollo, PostgreSQL en produccion (via Docker)

---

## Stack tecnologico

### Backend
- **Django 5.0** con Django REST Framework
- **Autenticacion JWT** (`djangorestframework-simplejwt`) con refresh automatico
- **Base de datos**: SQLite3 (desarrollo) / PostgreSQL (produccion)
- **Procesamiento PDF**: `pdfplumber` + `PyPDF2` para extraccion de DNI y splitting automatico
- **CKEditor** para contenido enriquecido en comunicados

### Frontend
- **React 18** con React Router 6
- **Tailwind CSS** con sistema de diseno basado en variables CSS (HSL)
- **Radix UI** para componentes accesibles (Dialog, DropdownMenu, Sheet)
- **Lucide React** para iconografia
- **Framer Motion** para animaciones
- **Axios** con interceptores para gestion automatica de tokens

---

## Estructura del proyecto

```
Portal-Employes/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── base/
│   │   ├── models.py            # Profile, PdfFile, Vacacion, Post, PostView
│   │   ├── serializer.py
│   │   ├── admin.py
│   │   ├── api/
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   └── templates/           # Plantillas PDF para vacaciones
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # Dashboard, Nominas, Vacaciones, Comunicados
│   │   ├── components/          # Componentes reutilizables (ui/, auth/, vacations/)
│   │   ├── contexts/            # VacationContext, NominasContext, ViewsContext
│   │   ├── hooks/               # useDarkMode
│   │   ├── api.js               # Axios con interceptores JWT
│   │   └── index.css            # Sistema de diseno (variables CSS light/dark)
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── LICENSE
```

---

## Inicio rapido

### Con Docker (recomendado)

```bash
git clone https://github.com/jv-maroto/Portal-Employes.git
cd Portal-Employes
docker-compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| API REST | http://localhost/api/ |
| Django Admin | http://localhost/admin/ |

### Desarrollo local

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (en otra terminal)
cd frontend
npm install
npm start
```

El frontend en desarrollo hace proxy al backend en `localhost:8000`.

---

## Autenticacion

1. Login con usuario/contrasena via `/api/token/`
2. Se almacenan tokens JWT (access + refresh) en `localStorage`
3. Axios interceptor anade `Authorization: Bearer <token>` automaticamente
4. Refresh automatico cada 25 minutos
5. Respuestas 401 disparan refresh o redireccion a login

---

## Variables de entorno

### Backend (`backend/backend/settings.py`)
| Variable | Descripcion | Default |
|---|---|---|
| `SECRET_KEY` | Clave secreta Django | Generada |
| `DEBUG` | Modo debug | `True` |
| `DATABASE_URL` | URL de base de datos | SQLite3 |
| `EMAIL_HOST_USER` | Email para notificaciones | — |

### Frontend
| Variable | Descripcion | Default |
|---|---|---|
| `REACT_APP_API_URL` | URL base de la API | `http://localhost:8000/api/` |

---

## Seguridad

Este proyecto ha pasado por una revision de seguridad que incluye:

- **Credenciales externalizadas**: Todas las claves sensibles (`SECRET_KEY`, contrasenas SMTP, credenciales de base de datos) se gestionan mediante variables de entorno con `.env`, nunca hardcodeadas en el codigo
- **Sanitizacion de contenido**: Uso de `DOMPurify` para prevenir XSS en contenido HTML renderizado (comunicados)
- **Autenticacion JWT**: Tokens de acceso con expiracion de 8 horas y refresh tokens de 7 dias, con renovacion automatica
- **Validacion de archivos**: Procesamiento seguro de PDFs en el backend con extraccion automatica de DNI
- **Rutas protegidas**: Todas las rutas privadas verifican autenticacion antes de renderizar, con redireccion automatica a login
- **CORS configurado**: Origenes permitidos definidos explicitamente en produccion

> Ver [PR #3](https://github.com/jv-maroto/Portal-Employes/pull/3) para los detalles de los fixes de seguridad aplicados.

---

## Licencia

Este proyecto esta bajo la licencia MIT. Ver [LICENSE](LICENSE) para mas detalles.

---

<div align="center">

**Portal Corp** — Sistema de gestion empresarial

Desarrollado por [Javier Jose Maroto](https://github.com/jv-maroto)

[![GitHub](https://img.shields.io/badge/GitHub-jv--maroto-181717?style=flat-square&logo=github)](https://github.com/jv-maroto/Portal-Employes)

</div>
