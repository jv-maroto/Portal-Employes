#!/bin/bash

# Script para inicializar el proyecto Docker fácilmente

echo "🐳 Iniciando Portal Empleados con Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose detectados"

# Construir y ejecutar
echo "🔨 Construyendo imágenes Docker..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de la base de datos..."
docker-compose exec -T backend python manage.py migrate

# Recopilar archivos estáticos
echo "📁 Recopilando archivos estáticos..."
docker-compose exec -T backend python manage.py collectstatic --noinput

echo ""
echo "🎉 ¡Portal Empleados está listo!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 Django Admin: http://localhost/admin/"
echo "🌐 API: http://localhost/api/"
echo ""
echo "Para crear un superusuario, ejecuta:"
echo "docker-compose exec backend python manage.py createsuperuser"
echo ""
echo "Para ver los logs:"
echo "docker-compose logs -f"
echo ""
echo "Para detener:"
echo "docker-compose down"