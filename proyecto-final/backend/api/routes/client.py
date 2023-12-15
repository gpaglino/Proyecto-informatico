from api import app
from api.models.client import Cliente
from flask import jsonify, request
from api.utils import token_required
from api.db.db import mysql

# Mostrar un cliente por ID
@app.route('/user/<int:id_user>/client/<int:id_client>', methods=['GET'])
@token_required
def get_client_by_id(id_user, id_client):
    try:
        cur = mysql.cursor()
        # Verificar si el cliente existe y está activo
        cur.execute('SELECT * FROM clientes WHERE id_cliente = %s AND id_usuario = %s AND visible = 1', (id_client, id_user))
        data = cur.fetchone()
        cur.close()

        if data:
            objCliente = Cliente(data)
            return jsonify(objCliente.to_json()), 200
        else:
            return jsonify({"message": "Cliente no encontrado o inactivo"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Mostrar todos los clientes por usuario
@app.route('/user/<int:id_user>/client', methods=['GET'])
@token_required
def get_all_clients_by_user_id(id_user):
    try:
        cur = mysql.cursor()

        # Obtener todos los clientes activos para el usuario
        cur.execute('SELECT * FROM clientes WHERE id_usuario = %s AND visible = 1', (id_user,))
        data = cur.fetchall()

        clientList = []
        for row in data:
            # Verifica que la tupla tenga al menos un elemento antes de crear el objeto Cliente
            if row:
                objCliente = Cliente(row)
                clientList.append(objCliente.to_json())

        return jsonify(clientList), 200

    except Exception as e:
        # Agrega una impresión para depuración
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Crear un cliente
@app.route('/user/<int:id_user>/client', methods=['POST'])
@token_required
def create_client(id_user):
    try:
        # Obtener datos del nuevo cliente desde la solicitud
        data = request.get_json()

        # Verificar si el DNI ya existe en la base de datos
        cur = mysql.cursor()
        cur.execute('SELECT id_cliente FROM clientes WHERE dni = %s AND id_usuario = %s', (data['dni'], id_user))
        existing_client = cur.fetchone()

        if existing_client:
            return jsonify({"message": "El cliente con el mismo DNI ya existe"}), 400

        # Realizar la inserción en la base de datos
        cur.execute(
            'INSERT INTO clientes (nombre_cliente, direccion, telefono, correo_electronico, dni, id_usuario, visible) VALUES (%s, %s, %s, %s, %s, %s, 1)',
            (data['nombre_cliente'], data['direccion'], data['telefono'], data['correo_electronico'], data['dni'], id_user)
        )
        mysql.commit()

        # Obtener el ID del cliente recién creado
        new_client_id = cur.lastrowid

        # Obtener los datos del nuevo cliente para retornarlos como respuesta
        cur.execute('SELECT * FROM clientes WHERE id_cliente = %s', (new_client_id,))
        new_client_data = cur.fetchone()
        new_client = Cliente(new_client_data)

        return jsonify(new_client.to_json()), 201  # 201 significa "Created"

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Actualizar un cliente
@app.route('/user/<int:id_user>/client/<int:id_client>', methods=['PUT'])
@token_required
def update_client(id_user, id_client):
    try:
        # Obtener datos actualizados del cliente desde la solicitud
        data = request.get_json()

        # Verificar si el cliente existe y está activo
        cur = mysql.cursor()
        cur.execute('SELECT id_cliente FROM clientes WHERE id_cliente = %s AND id_usuario = %s AND visible = 1', (id_client, id_user))
        existing_client = cur.fetchone()

        if not existing_client:
            return jsonify({"message": "Cliente no encontrado o inactivo"}), 404

        # Verificar si el DNI ya existe en otro cliente (excluyendo el cliente actual)
        cur.execute('SELECT id_cliente FROM clientes WHERE dni = %s AND id_cliente != %s AND id_usuario = %s AND visible = 1', (data['dni'], id_client, id_user))
        conflicting_client = cur.fetchone()

        if conflicting_client:
            return jsonify({"message": "El DNI pertenece a otro cliente"}), 400

        # Actualizar los datos del cliente en la base de datos
        cur.execute(
            'UPDATE clientes SET nombre_cliente=%s, direccion=%s, telefono=%s, correo_electronico=%s, dni=%s WHERE id_cliente=%s AND id_usuario=%s',
            (data['nombre_cliente'], data['direccion'], data['telefono'], data['correo_electronico'], data['dni'], id_client, id_user)
        )
        mysql.commit()

        # Obtener los datos actualizados del cliente para retornarlos como respuesta
        cur.execute('SELECT * FROM clientes WHERE id_cliente = %s AND id_usuario = %s', (id_client, id_user))
        updated_client_data = cur.fetchone()

        if updated_client_data:
            updated_client = Cliente(updated_client_data)
            return jsonify(updated_client.to_json()), 200
        else:
            return jsonify({"message": "Cliente no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Eliminar Cliente (lógico)
@app.route('/user/<int:id_user>/client/<int:id_client>', methods=['DELETE'])
@token_required
def delete_client(id_user, id_client):
    try:
        # Verificar si el cliente ya está inactivo
        cur = mysql.cursor()
        cur.execute('SELECT id_cliente FROM clientes WHERE id_cliente = %s AND id_usuario = %s AND visible = 0', (id_client, id_user))
        already_inactive = cur.fetchone()

        if already_inactive:
            return jsonify({"message": "El cliente ya está inactivo"}), 400

        # Actualizar la visibilidad del cliente en lugar de eliminarlo físicamente
        cur.execute('UPDATE clientes SET visible = 0 WHERE id_cliente = %s AND id_usuario = %s', (id_client, id_user))
        mysql.commit()

        return jsonify({"message": "Cliente marcado como no visible (eliminado lógicamente)"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ranking de ventas por cliente
@app.route('/user/<int:id_user>/ranking/client', methods=['GET'])
@token_required
def get_ranking_client_by_user(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('''
            SELECT 
                c.id_cliente,
                c.nombre_cliente,
                COUNT(DISTINCT f.id_factura) AS total_ventas
            FROM clientes c
            LEFT JOIN factura f ON c.id_cliente = f.id_cliente and f.visible = 1
            LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura AND df.visible = 1
            WHERE c.id_usuario = %s AND c.visible = 1
            GROUP BY c.id_cliente, c.nombre_cliente
            ORDER BY total_ventas DESC
        ''', (id_user,))

        data = cur.fetchall()

        ranking_clientes = []
        for row in data:
            cliente = {
                "id_cliente": row[0],
                "nombre_cliente": row[1],
                "total_ventas": row[2]
            }
            ranking_clientes.append(cliente)

        return jsonify(ranking_clientes), 200

    except mysql.Error as err:
        print("Error de MySQL:", err)
        return jsonify({"error": str(err)}), 500

    finally:
        cur.close()


