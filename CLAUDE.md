# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Instructions for Claude Code
- **ALWAYS respond in Spanish (español)**
## Project Overview

Portal-Employes is an employee portal application with a Django REST API backend and React frontend. The system manages employee payslips (nóminas), vacation requests (vacaciones), and company announcements (comunicados).

## Architecture

### Backend (Django)
- **Location**: `backend/` directory
- **Framework**: Django 5.0.3 with Django REST Framework
- **Database**: SQLite3 (`db.sqlite3`)
- **Authentication**: JWT tokens using `djangorestframework-simplejwt`
- **Key apps**: `base` (main app containing models, views, serializers)

**Core Models**:
- `Profile`: User profile with DNI, first_name, last_name
- `PdfFile`: Payslip PDFs with automatic processing and DNI extraction
- `Vacacion`: Vacation requests with approval workflow 
- `Post`: Company announcements with CKEditor rich text content
- `PostView`: Tracking which users have viewed announcements

**PDF Processing**: The system automatically processes uploaded PDFs by splitting multi-page files and extracting DNI numbers from content to associate with users.

### Frontend (React)
- **Location**: `frontend/` directory  
- **Framework**: React 18.3.1 with React Router 6
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI, React Bootstrap, Lucide React icons
- **HTTP Client**: Axios with automatic JWT token refresh
- **State Management**: React Context API for vacation, payslip, and post data

**Key Pages**:
- Dashboard: Overview with recent payslips, vacation summary, calendar, announcements
- Nóminas: Payslip viewing and management
- Vacaciones: Vacation request submission and tracking  
- Comunicados: Company announcements viewing
- Admin: Vacation management table for administrators

## Development Commands

### Backend Development
```bash
cd backend

# Start development server
python manage.py runserver

# Database operations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create user profiles
python manage.py create_profiles

# Django shell
python manage.py shell

# Run tests
python manage.py test
```

### Frontend Development
```bash
cd frontend

# Start development server (proxies to Django backend)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Key Configuration

### Backend Settings
- **CORS**: Configured to allow all origins for development
- **Media files**: Stored in `backend/media/` directory
- **Static files**: Collected to `backend/staticfiles/`
- **JWT tokens**: 8-hour access tokens, 7-day refresh tokens
- **Email**: SMTP configured for vacation request notifications

### Frontend Configuration
- **Proxy**: `package.json` configured to proxy API requests to `localhost:8000`
- **API Base URL**: Configurable via `REACT_APP_API_URL` environment variable
- **Build tool**: Uses `react-app-rewired` for custom webpack configuration

## Authentication Flow

1. Users login with username/password via `/api/token/`
2. Frontend stores access and refresh tokens in localStorage
3. API requests automatically include Bearer token in Authorization header
4. Tokens refresh automatically every 25 minutes
5. 401 responses trigger automatic token refresh or redirect to login

## File Structure Patterns

### Backend
- `base/models.py`: All database models
- `base/api/views.py`: API endpoints 
- `base/serializer.py`: DRF serializers
- `base/admin.py`: Django admin configuration
- `base/templates/`: HTML templates for PDF generation

### Frontend  
- `src/pages/`: Main page components
- `src/components/`: Reusable UI components
- `src/contexts/`: React Context providers
- `src/api.js`: Axios configuration with interceptors

## Development Notes

- The application is configured for Spanish language (`LANGUAGE_CODE = 'es'`)
- PDF processing uses `pdfplumber` for text extraction and `PyPDF2` for manipulation
- User authentication is tied to DNI numbers extracted from payslip PDFs
- Vacation requests generate PDF documents using Django templates
- The system includes view tracking for company announcements