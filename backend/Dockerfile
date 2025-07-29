# Usar imagen base de Python
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY requirements.txt .
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorio para archivos estáticos y media
RUN mkdir -p staticfiles media

# Recopilar archivos estáticos
RUN python manage.py collectstatic --noinput

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]