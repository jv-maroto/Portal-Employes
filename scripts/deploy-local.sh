#!/bin/bash

# Script para desplegar Portal Empleados en producción local
# Para usar con sagreracanarias.es/trabajadores

echo "🚀 Desplegando Portal Empleados en producción local..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.local.yml" ]; then
    echo "❌ Error: No se encuentra docker-compose.local.yml"
    echo "Ejecuta este script desde la carpeta raíz del proyecto"
    exit 1
fi

echo "📋 Verificando configuración..."

# Verificar que existe el archivo .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No se encuentra backend/.env"
    echo "Copiando configuración por defecto..."
    cp env.local backend/.env
    echo "✅ Archivo .env creado. IMPORTANTE: Revisa y ajusta las credenciales!"
fi

echo "🐳 Construyendo imágenes Docker..."
docker-compose -f docker-compose.local.yml build

echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.local.yml up -d

echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

echo "🗄️ Ejecutando migraciones de base de datos..."
docker exec portal-empleados-backend python manage.py migrate --noinput

echo "📁 Recopilando archivos estáticos..."
docker exec portal-empleados-backend python manage.py collectstatic --noinput

echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.local.yml ps

echo ""
echo "🎉 ¡Despliegue completado!"
echo ""
echo "📱 Accesos:"
echo "   🌐 Portal: https://sagreracanarias.es/trabajadores/"
echo "   🔧 Admin:  https://sagreracanarias.es/trabajadores/admin/"
echo "   📡 API:    https://sagreracanarias.es/trabajadores/api/"
echo ""
echo "📊 Monitoreo:"
echo "   Ver logs: docker-compose -f docker-compose.local.yml logs -f"
echo "   Estado:   docker-compose -f docker-compose.local.yml ps"
echo ""
echo "🔐 Para crear un superusuario:"
echo "   docker exec -it portal-empleados-backend python manage.py createsuperuser"
echo ""

# Verificar conectividad
echo "🔍 Verificando conectividad..."
if curl -s http://localhost:8001/api/ > /dev/null; then
    echo "✅ Backend respondiendo correctamente"
else
    echo "❌ Backend no responde"
fi

if curl -s http://localhost:3001/ > /dev/null; then
    echo "✅ Frontend respondiendo correctamente"
else
    echo "❌ Frontend no responde"
fi

echo ""
echo "📝 Recuerda:"
echo "   1. Configurar nginx según SETUP-LOCAL.md"
echo "   2. Verificar que SSL esté activo para sagreracanarias.es"
echo "   3. Crear superusuario para acceder al admin"
echo ""
echo "🎯 ¡El Portal Empleados está listo para usar!"