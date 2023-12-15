from api import app
from flask import jsonify, request
from api.models.movimientos_stock import MovimientoStock
from api.utils import token_required
from api.db.db import mysql
from datetime import datetime

# Ruta para el informe de movimiento de stock por id
@app.route('/user/<int:id_user>/informe_movimiento_stock/<int:id_producto>', methods=['GET'])
@token_required
def informe_movimiento_stock_id(id_user, id_producto):
    try:
        with mysql.cursor() as cursor:
            # Verificar que el producto está visible y obtener el nombre del producto
            cursor.execute('SELECT visible, nombre_producto FROM productos WHERE id_producto = %s', (id_producto,))
            producto_info = cursor.fetchone()
            if not producto_info or not producto_info[0]:
                return jsonify({"error": "El producto no está visible o no existe"}), 401

            visible, nombre_producto = producto_info

            # Obtener movimientos de stock para el producto específico
            sql_movimientos = """
            SELECT id_movimiento, cantidad_vendida, fecha, id_producto, stock, stock_inicial, id_factura, tipo_movimiento
            FROM movimientos_stock
            WHERE id_producto = %s AND visible = 1
            ORDER BY fecha DESC, id_movimiento DESC
            """
            cursor.execute(sql_movimientos, (id_producto,))
            movimientos_data = cursor.fetchall()

            movimientos = []
            for movimiento_data in movimientos_data:
                movimiento = MovimientoStock(movimiento_data)
                movimientos.append(movimiento.to_json())

            # Crear el informe
            informe = {
                "id_producto": id_producto,
                "nombre_producto": nombre_producto,
                "movimientos": movimientos
            }

            return jsonify(informe), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Ruta para el informe de ventas de productos de un usuario
@app.route('/user/<int:id_user>/informe_movimiento_stock', methods=['GET'])
@token_required
def informe_ventas_productos_usuario(id_user):
    try:
        with mysql.cursor() as cursor:
            # Obtener movimientos de stock para todos los productos visibles del usuario
            sql_movimientos = """
            SELECT ms.id_movimiento, ms.cantidad_vendida, ms.fecha, ms.id_producto, ms.stock, ms.stock_inicial, ms.id_factura, ms.tipo_movimiento, p.nombre_producto
            FROM movimientos_stock ms
            JOIN productos p ON ms.id_producto = p.id_producto
            WHERE p.id_usuario = %s AND p.visible = 1 AND ms.visible = 1
            ORDER BY ms.fecha DESC, ms.id_movimiento DESC
            """
            cursor.execute(sql_movimientos, (id_user,))
            movimientos_data = cursor.fetchall()

            movimientos = []
            for movimiento_data in movimientos_data:
                movimiento = MovimientoStock(movimiento_data)
                movimiento_json = movimiento.to_json()
                movimiento_json["nombre_producto"] = movimiento_data[8]
                movimientos.append(movimiento_json)
                

            # Crear el informe
            informe = {
                "id_usuario": id_user,
                "movimientos": movimientos
            }

            return jsonify(informe), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500