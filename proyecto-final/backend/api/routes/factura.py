from api import app
from flask import jsonify, request
from datetime import datetime
from api.utils import token_required
from api.models.factura import Factura
from api.models.detalle_factura import DetalleFactura
from api.db.db import mysql

# Consultar todas las facturas realizadas por un usuario
@app.route('/user/<int:id_user>/factura', methods=['GET'])
@token_required
def get_facturas_all(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM factura WHERE id_usuario = %s AND visible = 1', (id_user,))
        data = cur.fetchall()

        factura_list = []
        for row in data:
            if row:
                factura = Factura(row)
                factura_json = factura.to_json()

                # Eliminar el campo id_usuario del JSON
                factura_json.pop("id_usuario", None)

                factura_list.append(factura_json)

        return jsonify(factura_list), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Consultar factura por id
@app.route('/user/<int:id_user>/factura/<int:id_factura>', methods=['GET'])
@token_required
def get_factura_by_id(id_user, id_factura):
    try:
        cur = mysql.cursor()

        # Realizar una consulta JOIN para obtener el nombre del cliente y el monto total de la factura
        cur.execute('''
            SELECT f.id_factura, f.id_cliente, f.fecha, c.nombre_cliente, 
                   SUM(df.subtotal) as monto_total
            FROM factura f
            INNER JOIN clientes c ON f.id_cliente = c.id_cliente
            LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
            WHERE f.id_usuario = %s AND f.id_factura = %s AND f.visible = 1
            GROUP BY f.id_factura, f.id_cliente, f.fecha, c.nombre_cliente
        ''', (id_user, id_factura))

        data = cur.fetchone()

        if data:
            factura_data = {
                "id_factura": data[0],
                "id_cliente": data[1],
                "fecha": str(data[2]),
                "nombre_cliente": data[3],
                "monto_total": float(data[4]) if data[4] is not None else 0.0
            }
            return jsonify(factura_data), 200
        else:
            return jsonify({"message": "Factura no encontrada o anulada"}), 404

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Consultar total facturado a un cliente
@app.route('/user/<int:id_user>/factura/<int:id_cliente>/total', methods=['GET'])
@token_required
def get_total_facturado_cliente(id_user, id_cliente):
    try:
        cur = mysql.cursor()

        # Verificar si el usuario actual tiene acceso al cliente
        cur.execute('SELECT * FROM clientes WHERE id_usuario = %s AND id_cliente = %s', (id_user, id_cliente))
        cliente_data = cur.fetchone()

        if cliente_data:
            # El usuario tiene acceso al cliente, ahora verificamos si la factura existe
            cur.execute('SELECT SUM(df.subtotal) FROM detalle_factura df INNER JOIN factura f ON df.id_factura = f.id_factura WHERE f.id_cliente = %s AND f.visible = 1', (id_cliente,))
            total_facturado = cur.fetchone()[0] or 0

            return jsonify({"total_facturado": float(total_facturado)}), 200
        else:
            # El usuario no tiene acceso al cliente, devolver un mensaje de error con código 404
            return jsonify({"error": "Acceso no permitido al cliente"}), 404

    except Exception as e:
        print("Error:", str(e))
        # En caso de cualquier otro error, devolver un mensaje de error con código 500 (Internal Server Error)
        return jsonify({"error": str(e)}), 500

# Consultar monto total facturado
@app.route('/user/<int:id_user>/factura/total', methods=['GET'])
@token_required
def get_monto_total_facturado(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT SUM(df.subtotal) FROM detalle_factura df INNER JOIN factura f ON df.id_factura = f.id_factura WHERE f.id_usuario = %s AND f.visible = 1', (id_user,))
        monto_total_facturado = cur.fetchone()[0] or 0

        return jsonify({"monto_total_facturado": float(monto_total_facturado)}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Consultar detalle de factura por id
@app.route('/user/<int:id_user>/factura/<int:id_factura>/detalle', methods=['GET'])
@token_required
def get_detalle_factura_by_id(id_user, id_factura):
    try:
        cur = mysql.cursor()
        cur.execute('''
            SELECT 
                df.id_detalle,
                df.id_factura,
                df.id_producto,
                df.id_servicio,
                df.cantidad,
                COALESCE(p.precio, s.precio, 0.0) AS precio_unitario,
                df.subtotal AS monto_total,
                COALESCE(c.nombre_cliente, '') AS nombre_cliente,
                p.nombre_producto AS nombre_producto,
                s.nombre_servicio AS nombre_servicio,
                s.precio AS precio_servicio  -- Agregar el precio del servicio
            FROM detalle_factura df
            LEFT JOIN factura f ON df.id_factura = f.id_factura
            LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
            LEFT JOIN productos p ON df.id_producto = p.id_producto
            LEFT JOIN servicios s ON df.id_servicio = s.id_servicio
            WHERE f.id_usuario = %s AND df.id_factura = %s AND f.visible = 1
        ''', (id_user, id_factura))

        data = cur.fetchall()

        if not data:
            return jsonify({"error": "No se encontraron detalles de factura activos"}), 404

        detalle_factura = []
        for row in data:
            # Crear una instancia de la clase DetalleFactura con los datos obtenidos
            detalle = DetalleFactura(row)

            # Convertir el objeto DetalleFactura a JSON utilizando el método to_json
            detalle_json = detalle.to_json()

            # Agregar campos adicionales
            detalle_json["precio_unitario"] = float(row[5])
            detalle_json["monto_total"] = float(row[6])
            detalle_json["nombre_cliente"] = row[7]
            detalle_json["nombre_producto"] = row[8]
            detalle_json["nombre_servicio"] = row[9]
            detalle_json["precio_servicio"] = float(row[10]) if row[10] is not None else None

            detalle_factura.append(detalle_json)

        return jsonify(detalle_factura), 200

    except mysql.Error as err:
        print("Error de MySQL:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        cur.close()


# Consultar detalle de todas las facturas de un usuario
@app.route('/user/<int:id_user>/factura/detalle', methods=['GET'])
@token_required
def get_detalle_factura_by_user(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('''
            SELECT 
                df.id_detalle,
                df.id_factura,
                df.id_producto,
                df.id_servicio,
                df.cantidad,
                COALESCE(p.precio, s.precio, 0.0) AS precio_unitario,
                df.subtotal AS monto_total,
                COALESCE(c.nombre_cliente, '') AS nombre_cliente,
                p.nombre_producto AS nombre_producto,
                s.nombre_servicio AS nombre_servicio,
                s.precio AS precio_servicio  -- Agregar el precio del servicio
            FROM detalle_factura df
            LEFT JOIN factura f ON df.id_factura = f.id_factura
            LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
            LEFT JOIN productos p ON df.id_producto = p.id_producto
            LEFT JOIN servicios s ON df.id_servicio = s.id_servicio
            WHERE f.id_usuario = %s AND f.visible = 1
        ''', (id_user,))

        data = cur.fetchall()

        detalle_facturas = []
        for row in data:
            detalle = DetalleFactura(row)
            detalle_json = detalle.to_json()

            detalle_json["precio_unitario"] = float(row[5])
            detalle_json["monto_total"] = float(row[6])
            detalle_json["nombre_cliente"] = row[7]
            detalle_json["nombre_producto"] = row[8]
            detalle_json["nombre_servicio"] = row[9]
            detalle_json["precio_servicio"] = float(row[10]) if row[10] is not None else None

            detalle_facturas.append(detalle_json)

        return jsonify(detalle_facturas), 200

    except mysql.Error as err:
        print("Error de MySQL:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        cur.close()


# Anulación de factura por id (borrado lógico)
@app.route('/user/<int:id_user>/factura/<int:id_factura>', methods=['DELETE'])
@token_required
def cancel_factura(id_user, id_factura):
    try:
        cur = mysql.cursor()

        # Verificar si la factura está asociada al usuario
        cur.execute('SELECT id_factura FROM factura WHERE id_usuario = %s AND id_factura = %s AND visible = 1', (id_user, id_factura))
        factura_data = cur.fetchone()

        if factura_data:
            # La factura está asociada al usuario, proceder con el borrado lógico

            # Actualizar detalle de factura (borrado lógico)
            cur.execute('UPDATE detalle_factura SET visible = 0 WHERE id_factura = %s', (id_factura,))

            # Actualizar factura (borrado lógico)
            cur.execute('UPDATE factura SET visible = 0 WHERE id_usuario = %s AND id_factura = %s', (id_user, id_factura))

            # Actualizar movimientos de stock asociados a la factura (borrado lógico)
            cur.execute('UPDATE movimientos_stock SET visible = 0 WHERE id_factura = %s', (id_factura,))

            mysql.commit()

            return jsonify({"message": "Factura y sus movimientos de stock anulados exitosamente (borrado lógico)"}), 200
        else:
            # La factura no está asociada al usuario o ya está anulada, retornar un mensaje de error
            return jsonify({"error": "Factura no encontrada, no asociada al usuario o ya anulada"}), 403

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

# Crear factura con control de stock y fecha personalizada
@app.route('/user/<int:id_user>/facturas', methods=['POST'])
@token_required
def create_factura(id_user):
    try:
        data = request.get_json()

        cur = mysql.cursor()

        # Insertar la factura en la base de datos
        cur.execute(
            'INSERT INTO factura (id_cliente, id_usuario, fecha) VALUES (%s, %s, %s)',
            (data.get('id_cliente'), id_user, data.get('fecha'))
        )
        mysql.commit()

        new_factura_id = cur.lastrowid

        # Insertar los detalles de la factura en la tabla detalle_factura
        if data.get('productos'):
            for id_producto, cantidad in data['productos'].items():
                # Obtener el stock actual del producto
                cur.execute('SELECT stock, stock_inicial FROM productos WHERE id_producto = %s', (int(id_producto),))
                stock_actual, stock_inicial = cur.fetchone()  # Accedemos a los elementos de la tupla

                # Verificar si hay suficiente stock para la cantidad solicitada
                if stock_actual <= cantidad:
                    return jsonify({"error": f"No hay suficiente stock para el producto {id_producto}"}), 400

                # Actualizar el stock restando la cantidad vendida
                nuevo_stock = stock_actual - cantidad
                cur.execute('UPDATE productos SET stock = %s WHERE id_producto = %s', (nuevo_stock, int(id_producto)))
                mysql.commit()

                # Insertar el detalle de la factura
                cur.execute(
                    'INSERT INTO detalle_factura (id_factura, id_producto, cantidad, subtotal) VALUES (%s, %s, %s, %s)',
                    (new_factura_id, int(id_producto), cantidad, data.get('total'))
                )
                mysql.commit()

                # Crear un nuevo movimiento de stock para el producto vendido
                cur.execute(
                    'INSERT INTO movimientos_stock (cantidad_vendida, fecha, id_producto, stock, stock_inicial, tipo_movimiento, id_factura, visible) VALUES (%s, %s, %s, %s, %s, %s, %s, 1)',
                    (cantidad, data.get('fecha'), int(id_producto), nuevo_stock, stock_inicial, 2, new_factura_id)
                )
                mysql.commit()

        if data.get('id_servicio'):
            for id_servicio, activo in data['id_servicio'].items():
                if activo:
                    cur.execute(
                        'INSERT INTO detalle_factura (id_factura, id_servicio, subtotal) VALUES (%s, %s, %s)',
                        (new_factura_id, int(id_servicio), data.get('total'))
                    )
                    mysql.commit()

        return jsonify({"message": "Factura creada exitosamente", "id_factura": new_factura_id}), 201

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Consultar monto total facturado en un rango de fechas
@app.route('/user/<int:id_user>/factura/total/<fecha_inicio>/<fecha_fin>', methods=['GET'])
@token_required
def get_monto_total_facturado_between_dates(id_user, fecha_inicio, fecha_fin):
    try:
        # Convertir las fechas a formato datetime para la consulta
        fecha_inicio_format = datetime.strptime(fecha_inicio, '%Y-%m-%d')
        fecha_fin_format = datetime.strptime(fecha_fin, '%Y-%m-%d')

        cur = mysql.cursor()
        query = '''
            SELECT SUM(df.subtotal)
            FROM detalle_factura df
            INNER JOIN factura f ON df.id_factura = f.id_factura
            WHERE f.id_usuario = %s
            AND f.visible = 1
            AND f.fecha >= %s
            AND f.fecha <= %s
        '''
        cur.execute(query, (id_user, fecha_inicio_format, fecha_fin_format))
        monto_total_facturado = cur.fetchone()[0] or 0

        return jsonify({"monto_total_facturado": float(monto_total_facturado)}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
