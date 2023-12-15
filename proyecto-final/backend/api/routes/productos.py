from datetime import datetime
from api import app
from flask import jsonify, request
from api.utils import token_required
from api.db.db import mysql
from api.models.product import Producto

# Muestra todos los productos
@app.route('/user/<int:id_user>/product', methods=['GET'])
@token_required
def get_user_products(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM productos WHERE id_usuario = %s AND visible = 1', (id_user,))
        data = cur.fetchall()
        cur.close()

        product_list = []
        for row in data:
            if row:
                objProducto = Producto(row)
                product_list.append(objProducto.to_json())

        return jsonify(product_list), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Muestra los productos por id de producto
@app.route('/user/<int:id_user>/product/<int:id_product>', methods=['GET'])
@token_required
def get_user_product_by_id(id_user, id_product):
    try:
        cur = mysql.cursor()
        cur.execute('SELECT * FROM productos WHERE id_producto = %s AND id_usuario = %s AND visible = 1', (id_product, id_user))
        data = cur.fetchone()

        if data:
            objProducto = Producto(data)
            return jsonify(objProducto.to_json()), 200
        else:
            return jsonify({"message": "Producto no encontrado"}), 404

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Crear un producto
@app.route('/user/<int:id_user>/product', methods=['POST'])
@token_required
def create_user_product(id_user):
    try:
        data = request.get_json()

        cur = mysql.cursor()
        cur.execute(
            'INSERT INTO productos (nombre_producto, precio, stock, stock_inicial, id_usuario, visible) VALUES (%s, %s, %s, %s, %s, 1)',
            (data['nombre_producto'], data['precio'], data['stock'], data['stock'], id_user)
        )
        mysql.commit()

        new_product_id = cur.lastrowid

        # Crear un nuevo movimiento de stock para el producto creado
        cur.execute(
            'INSERT INTO movimientos_stock (cantidad_vendida, fecha, id_producto, stock, stock_inicial, tipo_movimiento, visible) VALUES (%s, %s, %s, %s, %s, %s, 1)',
            (0, datetime.now(), new_product_id, data['stock'], data['stock'], 0)
        )
        mysql.commit()

        cur.execute('SELECT * FROM productos WHERE id_producto = %s AND id_usuario = %s', (new_product_id, id_user))
        new_product_data = cur.fetchone()

        if new_product_data:
            new_product = Producto(new_product_data)
            return jsonify(new_product.to_json()), 201
        else:
            return jsonify({"message": "Error al obtener los datos del nuevo producto"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Actualizar un producto
@app.route('/user/<int:id_user>/product/<int:id_product>', methods=['PUT'])
@token_required
def update_user_product(id_user, id_product):
    try:
        data = request.get_json()

        cur = mysql.cursor()
        cur.execute(
            'UPDATE productos SET nombre_producto=%s, precio=%s, stock=%s WHERE id_producto=%s AND id_usuario=%s AND visible = 1',
            (data['nombre_producto'], data['precio'], data['stock'], id_product, id_user)
        )
        mysql.commit()

        # Crear un nuevo movimiento de stock para el producto actualizado
        cur.execute(
            'INSERT INTO movimientos_stock (cantidad_vendida, fecha, id_producto, stock, stock_inicial, tipo_movimiento, visible) VALUES (%s, %s, %s, %s, %s, %s, 1)',
            (0, datetime.now(), id_product, data['stock'], data['stock'], 1)
        )
        mysql.commit()

        cur.execute('SELECT * FROM productos WHERE id_producto = %s AND id_usuario = %s AND visible = 1', (id_product, id_user))
        updated_product_data = cur.fetchone()

        if updated_product_data:
            updated_product = Producto(updated_product_data)
            return jsonify(updated_product.to_json()), 200
        else:
            return jsonify({"message": "Producto no encontrado"}), 404

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Eliminar Producto (lógico)
@app.route('/user/<int:id_user>/product/<int:id_product>', methods=['DELETE'])
@token_required
def delete_user_product(id_user, id_product):
    try:
        # Verificar si el producto ya está inactivo
        cur = mysql.cursor()
        cur.execute('SELECT id_producto FROM productos WHERE id_producto = %s AND id_usuario = %s AND visible = 0', (id_product, id_user))
        already_inactive = cur.fetchone()

        if already_inactive:
            return jsonify({"message": "El producto ya está inactivo"}), 400

        # Actualizar la visibilidad del producto en lugar de eliminarlo físicamente
        cur.execute('UPDATE productos SET visible = 0 WHERE id_producto = %s AND id_usuario = %s AND visible = 1', (id_product, id_user))
        mysql.commit()

        # Actualizar la visibilidad de los movimientos de stock para el producto
        cur.execute('UPDATE movimientos_stock SET visible = 0 WHERE id_producto = %s AND visible = 1', (id_product,))
        mysql.commit()

        return jsonify({"message": "Producto y sus movimientos de stock marcados como no visibles (eliminados lógicamente)"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
# Ranking de ventas por producto
@app.route('/user/<int:id_user>/product/ranking', methods=['GET'])
@token_required
def get_ranking_product_by_user(id_user):
    try:
        cur = mysql.cursor()
        cur.execute('''
            SELECT 
                p.id_producto,
                p.nombre_producto,
                SUM(df.cantidad) AS total_ventas
            FROM productos p
            LEFT JOIN detalle_factura df ON p.id_producto = df.id_producto AND df.visible = 1
            LEFT JOIN factura f ON df.id_factura = f.id_factura
            WHERE p.id_usuario = %s AND p.visible = 1
            GROUP BY p.id_producto, p.nombre_producto
            ORDER BY total_ventas DESC
        ''', (id_user,))

        data = cur.fetchall()

        ranking_productos = []
        for row in data:
            producto = {
                "id_producto": row[0],
                "nombre_producto": row[1],
                "total_ventas": row[2]
            }
            ranking_productos.append(producto)

        return jsonify(ranking_productos), 200

    except mysql.Error as err:
        print("Error de MySQL:", err)
        return jsonify({"error": str(err)}), 500

    finally:
        cur.close()

