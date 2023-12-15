from api import app
from api.models.service import Servicio
from flask import jsonify, request
from api.utils import token_required
from api.db.db import mysql

# Ruta para obtener todos los servicios de un usuario
@app.route('/user/<int:id_user>/services', methods=['GET'])
@token_required
def get_user_services(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM servicios WHERE id_usuario = %s', (id_user,))
        data = cur.fetchall()
        cur.close()

        service_list = [Servicio(row).to_json() for row in data]

        return jsonify(service_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para obtener un servicio por ID de un usuario
@app.route('/user/<int:id_user>/services/<int:service_id>', methods=['GET'])
@token_required
def get_user_service_by_id(id_user, service_id):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM servicios WHERE id_servicio = %s AND id_usuario = %s', (service_id, id_user))
        data = cur.fetchone()

        if data:
            service = Servicio(data)
            return jsonify(service.to_json()), 200
        else:
            return jsonify({"message": "Servicio no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ruta para modificar un servicio por ID de un usuario
@app.route('/user/<int:id_user>/services/<int:service_id>', methods=['PUT'])
@token_required
def update_user_service(id_user, service_id):
    try:
        data = request.get_json()

        cur = mysql.cursor()
        cur.execute(
            'UPDATE servicios SET nombre_servicio=%s, precio=%s WHERE id_servicio=%s AND id_usuario = %s',
            (data['nombre_servicio'], data['precio'], service_id, id_user)
        )
        mysql.commit()

        cur.execute('SELECT * FROM servicios WHERE id_servicio = %s AND id_usuario = %s', (service_id, id_user))
        updated_service_data = cur.fetchone()

        if updated_service_data:
            updated_service = Servicio(updated_service_data)
            return jsonify(updated_service.to_json()), 200
        else:
            return jsonify({"message": "Servicio no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para agregar un nuevo servicio a un usuario
@app.route('/user/<int:id_user>/services', methods=['POST'])
@token_required
def create_user_service(id_user):
    try:
        data = request.get_json()

        cur = mysql.cursor()
        cur.execute(
            'INSERT INTO servicios (nombre_servicio, precio, id_usuario) VALUES (%s, %s, %s)',
            (data['nombre_servicio'], data['precio'], id_user)
        )
        mysql.commit()

        new_service_id = cur.lastrowid

        cur.execute('SELECT * FROM servicios WHERE id_servicio = %s AND id_usuario = %s', (new_service_id, id_user))
        new_service_data = cur.fetchone()

        if new_service_data:
            new_service = Servicio(new_service_data)
            return jsonify(new_service.to_json()), 201
        else:
            return jsonify({"message": "Error al obtener los datos del nuevo servicio"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para eliminar un servicio por ID de un usuario
@app.route('/user/<int:id_user>/services/<int:service_id>', methods=['DELETE'])
@token_required
def delete_user_service(id_user, service_id):
    try:
        cur = mysql.cursor()
        cur.execute('DELETE FROM servicios WHERE id_servicio = %s AND id_usuario = %s', (service_id, id_user))
        mysql.commit()

        return jsonify({"message": "Servicio eliminado exitosamente"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}, 500)
    
# Ranking de ventas por servicio
@app.route('/user/<int:id_user>/ranking/service', methods=['GET'])
@token_required
def get_ranking_service_by_user(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('''
            SELECT 
                s.id_servicio,
                s.nombre_servicio,
                COUNT(df.id_servicio) AS total_ventas
            FROM servicios s
            LEFT JOIN detalle_factura df ON s.id_servicio = df.id_servicio AND df.visible = 1
            LEFT JOIN factura f ON df.id_factura = f.id_factura
            WHERE s.id_usuario = %s AND s.visible = 1
            GROUP BY s.id_servicio, s.nombre_servicio
            ORDER BY total_ventas DESC
        ''', (id_user,))

        data = cur.fetchall()

        ranking_servicios = []
        for row in data:
            servicio = {
                "id_servicio": row[0],
                "nombre_servicio": row[1],
                "total_ventas": row[2]
            }
            ranking_servicios.append(servicio)

        return jsonify(ranking_servicios), 200

    except mysql.Error as err:
        print("Error de MySQL:", err)
        return jsonify({"error": str(err)}), 500

    finally:
       cur.close()


