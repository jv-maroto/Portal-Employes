import sqlite3
from datetime import datetime

# Conectar a la base de datos original (data.sqlite)
conn_origen = sqlite3.connect('data.sqlite')
cursor_origen = conn_origen.cursor()

# Conectar a la base de datos destino (db.sqlite3)
conn_destino = sqlite3.connect('db.sqlite3')
cursor_destino = conn_destino.cursor()

# Función para eliminar duplicados en la tabla auth_user


def eliminar_duplicados():
    cursor_destino.execute(
        "SELECT username, COUNT(*) as count FROM auth_user GROUP BY username HAVING count > 1")
    duplicados = cursor_destino.fetchall()
    for username, count in duplicados:
        # Mantener un registro y eliminar los duplicados
        cursor_destino.execute(
            "DELETE FROM auth_user WHERE username = ? AND rowid NOT IN (SELECT rowid FROM auth_user WHERE username = ? LIMIT 1)", (username, username))

# Función para revisar y actualizar contraseñas y last_login en auth_user


def actualizar_usuarios():
    cursor_destino.execute("SELECT id, password, last_login FROM auth_user")
    usuarios = cursor_destino.fetchall()
    for user_id, password, last_login in usuarios:
        actualizar_password = False
        actualizar_last_login = False

        if not password:
            nuevo_password = 'pbkdf2_sha256$720000$5565656'
            actualizar_password = True
        elif not password.startswith('pbkdf2_sha256$720000$'):
            nuevo_password = 'pbkdf2_sha256$720000$' + password
            actualizar_password = True
        else:
            nuevo_password = password

        if not last_login:
            nuevo_last_login = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            actualizar_last_login = True
        else:
            nuevo_last_login = last_login

        if actualizar_password or actualizar_last_login:
            cursor_destino.execute(
                "UPDATE auth_user SET password = ?, last_login = ? WHERE id = ?",
                (nuevo_password, nuevo_last_login, user_id))


# Eliminar duplicados si existen
eliminar_duplicados()

# Obtener datos de la tabla de trabajadores
cursor_origen.execute(
    "SELECT Codigo, Nombre, Apellidos, password FROM trabajadores")
trabajadores = cursor_origen.fetchall()

# Insertar datos en la tabla auth_user si no existen
for trabajador in trabajadores:
    codigo, nombre, apellidos, password = trabajador
    username = codigo
    first_name = nombre
    last_name = apellidos
    email = ''  # Utilizar cadena vacía en lugar de NULL
    last_login = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    date_joined = last_login
    is_superuser = 0
    is_staff = 0
    is_active = 1

    # Modificar la contraseña si no tiene el prefijo correcto o está vacía
    if not password:
        password = 'pbkdf2_sha256$720000$5565656'
    elif not password.startswith('pbkdf2_sha256$720000$'):
        password = 'pbkdf2_sha256$720000$' + password

    # Verificar si el username ya existe
    cursor_destino.execute(
        "SELECT COUNT(*) FROM auth_user WHERE username = ?", (username,))
    if cursor_destino.fetchone()[0] == 0:
        cursor_destino.execute('''
            INSERT INTO auth_user (
                password, last_login, is_superuser, username, last_name, email, is_staff, is_active, date_joined, first_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (password, last_login, is_superuser, username, last_name, email, is_staff, is_active, date_joined, first_name))

# Revisar y actualizar contraseñas y last_login en auth_user
actualizar_usuarios()

# Guardar cambios y cerrar conexiones
conn_destino.commit()
conn_origen.close()
conn_destino.close()

print("Migración y actualización de contraseñas completadas con éxito.")
