#!/bin/bash
# =============================================================================
# Auto-commit hook para Claude Code
# Se ejecuta después de cada Edit/Write
# Agrupa cambios en ventanas de ~10 segundos para evitar commits excesivos
# =============================================================================

# Desactivar con: export AUTO_COMMIT=0
[ "${AUTO_COMMIT:-1}" = "0" ] && exit 0

# Leer input JSON del hook (stdin)
INPUT=$(cat)

# Extraer file_path del JSON sin depender de Python
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')

# Si no hay archivo, salir silenciosamente
[ -z "$FILE_PATH" ] && exit 0

# Obtener raíz del repositorio
PROJECT_DIR=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$PROJECT_DIR" || exit 0

# Normalizar la ruta (Windows -> Unix)
NORMALIZED_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g')

# Intentar convertir ruta absoluta a relativa
PROJECT_NORMALIZED=$(echo "$PROJECT_DIR" | sed 's|\\|/|g')
REL_PATH=$(echo "$NORMALIZED_PATH" | sed "s|^${PROJECT_NORMALIZED}/||i")

# Stage el archivo modificado
git add "$REL_PATH" 2>/dev/null || git add "$NORMALIZED_PATH" 2>/dev/null || exit 0

# Si no hay cambios staged, salir
git diff --cached --quiet 2>/dev/null && exit 0

# --- Debounce: agrupar cambios en ventanas de ~10 segundos ---
# Usar mkdir como lock atómico (funciona en todos los OS)
SAFE_NAME=$(echo "$PROJECT_DIR" | tr '/:\\. ' '_____')
LOCK_DIR="/tmp/_autocommit_${SAFE_NAME}"

# Limpiar lock huérfano (más de 120 segundos = proceso muerto)
if [ -d "$LOCK_DIR" ] && [ -f "$LOCK_DIR/ts" ]; then
    LOCK_TS=$(cat "$LOCK_DIR/ts" 2>/dev/null || echo 0)
    NOW=$(date +%s)
    if [ $((NOW - LOCK_TS)) -gt 120 ] 2>/dev/null; then
        rm -rf "$LOCK_DIR" 2>/dev/null
    fi
fi

if mkdir "$LOCK_DIR" 2>/dev/null; then
    date +%s > "$LOCK_DIR/ts" 2>/dev/null

    # Proceso en segundo plano: espera y luego commit+push
    (
        sleep 10

        cd "$PROJECT_DIR" 2>/dev/null || { rm -rf "$LOCK_DIR" 2>/dev/null; exit 0; }

        # Obtener archivos staged
        STAGED=$(git diff --cached --name-only 2>/dev/null)
        if [ -z "$STAGED" ]; then
            rm -rf "$LOCK_DIR" 2>/dev/null
            exit 0
        fi

        # Contar archivos
        NUM=$(echo "$STAGED" | wc -l | tr -d '[:space:]')
        FIRST_FILE=$(echo "$STAGED" | head -1)
        FIRST_NAME=$(basename "$FIRST_FILE" | sed 's/\.[^.]*$//')

        # Detectar áreas modificadas
        FRONT=$(echo "$STAGED" | grep -c "^frontend/" 2>/dev/null || echo 0)
        BACK=$(echo "$STAGED" | grep -c "^backend/" 2>/dev/null || echo 0)

        # Generar mensaje de commit descriptivo en español
        if [ "$NUM" -eq 1 ]; then
            case "$FIRST_FILE" in
                frontend/src/components/*) MSG="Actualizar componente $FIRST_NAME" ;;
                frontend/src/pages/*)      MSG="Actualizar página $FIRST_NAME" ;;
                frontend/src/contexts/*)   MSG="Actualizar contexto $FIRST_NAME" ;;
                frontend/src/api*)         MSG="Actualizar configuración API" ;;
                frontend/*)                MSG="Actualizar $FIRST_NAME en frontend" ;;
                backend/base/api/*)        MSG="Actualizar API $FIRST_NAME" ;;
                backend/base/models*)      MSG="Actualizar modelos" ;;
                backend/base/serial*)      MSG="Actualizar serializers" ;;
                backend/base/views*)       MSG="Actualizar vistas" ;;
                backend/base/admin*)       MSG="Actualizar admin" ;;
                backend/*/settings*)       MSG="Actualizar configuración Django" ;;
                backend/*)                 MSG="Actualizar $FIRST_NAME en backend" ;;
                nginx/*)                   MSG="Actualizar configuración nginx" ;;
                docker-compose*)           MSG="Actualizar docker-compose" ;;
                .claude/*)                 MSG="Actualizar configuración Claude" ;;
                scripts/*)                 MSG="Actualizar script $FIRST_NAME" ;;
                *.sh)                      MSG="Actualizar script $FIRST_NAME" ;;
                *.md)                      MSG="Actualizar documentación" ;;
                *)                         MSG="Actualizar $FIRST_NAME" ;;
            esac
        elif [ "$NUM" -le 3 ]; then
            NAMES=$(echo "$STAGED" | while read -r f; do basename "$f" | sed 's/\.[^.]*$//'; done | sort -u | tr '\n' ', ' | sed 's/,$//' | sed 's/,/, /g')
            MSG="Actualizar $NAMES"
        else
            if [ "$FRONT" -gt 0 ] && [ "$BACK" -gt 0 ]; then
                MSG="Actualizar frontend y backend ($NUM archivos)"
            elif [ "$FRONT" -gt 0 ]; then
                MSG="Actualizar frontend ($NUM archivos)"
            elif [ "$BACK" -gt 0 ]; then
                MSG="Actualizar backend ($NUM archivos)"
            else
                MSG="Actualizar $NUM archivos"
            fi
        fi

        # Commit y push
        git commit -m "$MSG" --quiet 2>/dev/null
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
        git push origin "$BRANCH" --quiet 2>/dev/null

        # Liberar lock
        rm -rf "$LOCK_DIR" 2>/dev/null
    ) &
fi

exit 0
