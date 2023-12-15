from api import app
from api.utils import token_required
from api.models.users import Usuario
from flask import request, jsonify
from api.db.db import mysql
import jwt
import datetime

# Creación del usuario. A la espera de confirmación de que desde la Base de Datos se lo active
@app.route('/crearUsuario', methods=['POST'])
def create_user():
    try:
        data = request.get_json()

        # Puedes agregar validaciones aquí para asegurarte de que los datos sean correctos

        with mysql.cursor() as cur:
            # Crear usuario con estado inicial como falso
            cur.execute(
                'INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, categoria, estado_usuario) VALUES (%s, %s, %s, %s, %s)',
                (data['nombre_usuario'], data['correo_electronico'], data['contrasena'], data['categoria'], False)
            )
            mysql.commit()

            return jsonify({"message": "Usuario creado exitosamente", "estado_usuario": False}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Función para el inicio de sesión
@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return jsonify({"message": "Credenciales incompletas"}), 401

    cur = None  # Inicializar el cursor fuera del bloque try

    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM usuarios WHERE correo_electronico = %s', (auth.username,))
        user = cur.fetchone()

        if not user or user[3] != auth.password or not user[5]:
            return jsonify({"message": "Credenciales incorrectas o cuenta no activa"}), 401

        # Definir el estado del usuario como "USUARIO ACTIVO" o "USUARIO INACTIVO"
        estado_usuario = "USUARIO ACTIVO" if user[5] else "USUARIO INACTIVO"

        # Si el usuario no está activo, no se emite el token
        if not user[5]:
            return jsonify({"message": "La cuenta no está activa"}), 401

        # Leer todo el resultado antes de cerrar el cursor
        cur.fetchall()

        # Generar el token
        token_payload = {
            "id_usuario": user[0],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')

        # Devolver la respuesta JSON con el token, id de usuario, categoría y estado del usuario
        return jsonify({"token": token, "id_usuario": user[0], "categoria": user[4], "estado_usuario": estado_usuario}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Función para modificar usuario
@app.route('/user/<int:id_user>/update', methods=['PUT'])
def update_user(id_user):
    try:
        data = request.get_json()

        # Puedes agregar validaciones aquí para asegurarte de que los datos sean correctos

        with mysql.cursor() as cur:
            # Verificar si el usuario tiene permisos para actualizar sus propios datos
            cur.execute('SELECT * FROM usuarios WHERE id_usuario = %s', (id_user,))
            user = cur.fetchone()

            if not user:
                return jsonify({"message": "Usuario no encontrado"}), 404

            # Verificar si la categoría está presente en los datos, y si es así, actualizarla
            if 'categoria' in data:
                cur.execute('UPDATE usuarios SET nombre_usuario=%s, correo_electronico=%s, contrasena=%s, categoria=%s WHERE id_usuario=%s',
                            (data['nombre_usuario'], data['correo_electronico'], data['contrasena'], data['categoria'], id_user))
            else:
                cur.execute('UPDATE usuarios SET nombre_usuario=%s, correo_electronico=%s, contrasena=%s WHERE id_usuario=%s',
                            (data['nombre_usuario'], data['correo_electronico'], data['contrasena'], id_user))

            mysql.commit()

            # Obtener los datos actualizados del usuario para retornarlos como respuesta
            cur.execute('SELECT * FROM usuarios WHERE id_usuario = %s', (id_user,))
            updated_user_data = cur.fetchone()

            if updated_user_data:
                updated_user = Usuario(updated_user_data)
                return jsonify(updated_user.to_json()), 200
            else:
                return jsonify({"message": "Error al obtener los datos actualizados"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
    
@app.route('/user/<int:id_user>/get_usuario', methods=['GET'])
@token_required
def get_usuario(id_user):
    try:
        cur = mysql.cursor()

        # Realizar la consulta para obtener los datos del usuario verificando la pertenencia al usuario logueado
        cur.execute('SELECT * FROM usuarios WHERE id_usuario = %s AND id_usuario = %s', (id_user, id_user))
        user_data = cur.fetchone()

        if user_data:
            # Crear una instancia de la clase Usuario con los datos obtenidos
            usuario = Usuario(user_data)

            # Convertir el objeto Usuario a JSON utilizando el método to_json
            user_json = usuario.to_json()

            return jsonify(user_json), 200
        else:
            return jsonify({"error": "Usuario no encontrado o acceso no autorizado"}), 404

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()





