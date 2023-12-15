UNIVERSIDAD PROVINCIAL DEL SUDOESTE

CARRERA: TECNICATURA UNIVERSITARIA EN TECNOLOGIAS DE LA PROGRAMACION

MATERIA: PROYECTO INFORMATICO

PROFESOR: BERGER CARLOS

GRUPO: 1

INTEGRANTES:

• MACCHIA SEBASTIAN

• PAGLINO GUILLERMO

• PEÑA MATIAS

• RODRIGUEZ MIKAEL



# API RESTful implementada con Python + Flask + MYSQL


1. Crear directorio de proyecto (backend)

2. Crear entorno virtual    **py -3 -m venv .venv**

3. Activamos el entorno virtual  **.\.venv\Scripts\activate**

4. Creamos el archivo de requisitos
 - **requirements.txt**
	+ flask == 2.3.3
	+ mysql-connector-python
	+ PyJWT == 2.8.0
	+ flask-cors

5. Instalar dependencias    **pip install -r requirements.txt**

6. Crear estructura de directorios
	* /backend
		* /backend/api
			+ /backend/api/db
				* /backend/api/db/dp.py
			+ /backend/api/routes
				* /backend/api/routes/client.py
  				* /backend/api/routes/factura.py
				* /backend/api/routes/movimiento_stock.py
        		* /backend/api/routes/productos.py
          		* /backend/api/routes/service.py
          		* /backend/api/routes/user.py	
			+ /backend/api/models
          		* /backend/api/models/client.py
   				* /backend/api/models/factura.py
				* /backend/api/models/movimiento_stock.py
        		* /backend/api/models/productos.py
          		* /backend/api/models/service.py
          		* /backend/api/models/user.py
		+ /backend/api/__init__.py
		+ /backend/api/utils.py
	* /backend/main.py
	* /backend/requirements.txt
---

## Explicación:

### main.py 
Es el punto de inicio de la aplicación, su función es importar el objeto app y ejecutar su método run.

	from api import app
	import sys

	if len(sys.argv) > 1 and sys.argv[1] == "list":
		print(app.url_map)
	elif __name__ == "__main__":
		app.run( debug=True, port= 5200)

---
	
### Directorios 
+ /api organiza la estructura interna de la aplicación.
+ /api/routes contiene todos los archivos relacionados con las creaciones de rutas, cada uno agrupando las rutas referidas a un mismo recurso.
+ /api/models contiene todos los archivos relacionados con las definiciones de clases, principalmente para facilitar el formateo de datos desde la BD en formato JSON.
+ /api/db contiene lo relacionado a la configuración y conección a la BD.

---

### Archivos
**api/_\_init_\_.py** crea el objeto app como una instancia de Flask, incorpora CORS y configura la clave secreta de la aplicación. También debe importar todas las rutas para cada recurso.

	from flask import Flask
	from flask_cors import CORS

	app = Flask(__name__)

	CORS(app)

	app.config['SECRET_KEY'] = 'app_123'

	import api.routes.client
	import api.routes.user
	import api.routes.factura
	import api.routes.productos
	import api.routes.service
	import api.routes.movimiento_stock

**api/utils.py** contiene funciones genéricas que se utilizan en diferentes partes de la aplicación, por ejemplo los wrappers empleados para el control de acceso a diferentes rutas.

	from functools import wraps
	from flask import request, jsonify
	import jwt
	from api import app
	from api.db.db import mysql

	def token_required(func):
		@wraps(func)
		def decorated(\*args, \*\*kwargs):
			\# Control de token y retorno en caso de errores 
			\...
			return func(\*args, \*\*kwargs)
		return decorated
	
	\# Otras funciones ..

**api/db/db.py** contiene la configuración de la BD y crea el objeto mysql, que debe ser importado desde todos los módulos que requieran una conección a la BD.

	from api import app
	import mysql.connector

	Configuración de la base de datos
	db_config = {
		"host": "localhost",
		"user": "...",
		"password": "...",
		"database": "...",
	}

	# Crear una conexión a la base de datos
	mysql = mysql.connector.connect(**db_config)

**ROUTES**

## Rutas relacionadas con Clientes

### Mostrar un cliente por ID

- **Descripción de la Ruta:** Obtiene un cliente específico por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_client` (ID del cliente).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/client/123
    ```
- **Respuesta Esperada:** Devuelve los detalles del cliente en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Mostrar todos los clientes por usuario

- **Descripción de la Ruta:** Obtiene todos los clientes asociados a un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/client
    ```
- **Respuesta Esperada:** Devuelve una lista de clientes en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Crear un cliente

- **Descripción de la Ruta:** Crea un nuevo cliente para un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** POST.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_cliente":"Nuevo Cliente", "direccion":"Dirección Nueva", "telefono":"123456789", "correo_electronico":"cliente@ejemplo.com", "dni":"12345678"}' http://localhost:5200/user/1/client
    ```
- **Respuesta Esperada:** Devuelve los detalles del nuevo cliente en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Actualizar un cliente

- **Descripción de la Ruta:** Actualiza los detalles de un cliente existente.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_client` (ID del cliente).
- **Métodos HTTP Admitidos:** PUT.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_cliente":"Cliente Actualizado", "direccion":"Nueva Dirección", "telefono":"987654321", "correo_electronico":"cliente.actualizado@ejemplo.com", "dni":"87654321"}' http://localhost:5200/user/1/client/123
    ```
- **Respuesta Esperada:** Devuelve los detalles actualizados del cliente en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Eliminar Cliente (lógico)

- **Descripción de la Ruta:** Marca un cliente como no visible (eliminación lógica).
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_client` (ID del cliente).
- **Métodos HTTP Admitidos:** DELETE.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/client/123
    ```
- **Respuesta Esperada:** Devuelve un mensaje indicando que el cliente ha sido marcado como no visible.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Ranking de ventas por cliente

- **Descripción de la Ruta:** Obtiene un ranking de clientes por sus ventas.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/ranking/client
    ```
- **Respuesta Esperada:** Devuelve un ranking de clientes en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

## Rutas relacionadas con Facturas

### Consultar todas las facturas realizadas por un usuario

- **Descripción de la Ruta:** Obtiene todas las facturas asociadas a un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura
    ```
- **Respuesta Esperada:** Devuelve una lista de facturas en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar factura por ID

- **Descripción de la Ruta:** Obtiene detalles específicos de una factura por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_factura` (ID de la factura).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/123
    ```
- **Respuesta Esperada:** Devuelve los detalles de la factura en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar total facturado a un cliente

- **Descripción de la Ruta:** Obtiene el monto total facturado a un cliente.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_cliente` (ID del cliente).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/456/total
    ```
- **Respuesta Esperada:** Devuelve el monto total facturado al cliente en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar monto total facturado

- **Descripción de la Ruta:** Obtiene el monto total facturado por un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/total
    ```
- **Respuesta Esperada:** Devuelve el monto total facturado por el usuario en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar detalle de factura por ID

- **Descripción de la Ruta:** Obtiene el detalle de una factura por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_factura` (ID de la factura).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/123/detalle
    ```
- **Respuesta Esperada:** Devuelve el detalle de la factura en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar detalle de todas las facturas de un usuario

- **Descripción de la Ruta:** Obtiene el detalle de todas las facturas asociadas a un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/detalle
    ```
- **Respuesta Esperada:** Devuelve el detalle de todas las facturas en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Anulación de factura por ID (borrado lógico)

- **Descripción de la Ruta:** Anula una factura por su ID (borrado lógico).
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_factura` (ID de la factura).
- **Métodos HTTP Admitidos:** DELETE.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/123
    ```
- **Respuesta Esperada:** Devuelve un mensaje indicando que la factura ha sido anulada (borrado lógico).
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Crear factura con control de stock y fecha personalizada

- **Descripción de la Ruta:** Crea una nueva factura con control de stock y fecha personalizada.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** POST.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"id_cliente": 456, "fecha": "2023-12-03", "productos": {"1": 5, "2": 3}, "total": 150.0}' http://localhost:5200/user/1/facturas
    ```
- **Respuesta Esperada:** Devuelve un mensaje indicando que la factura ha sido creada exitosamente.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Consultar monto total facturado en un rango de fechas

- **Descripción de la Ruta:** Obtiene el monto total facturado por un usuario en un rango de fechas.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `fecha_inicio` (Fecha de inicio en formato YYYY-MM-DD), `fecha_fin` (Fecha de fin en formato YYYY-MM-DD).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/factura/total/2023-01-01/2023-12-31
    ```
- **Respuesta Esperada:** Devuelve el monto total facturado por el usuario en el rango de fechas especificado en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

## Rutas relacionadas con Movimientos de Stock

### Informe de movimiento de stock por ID de Producto

- **Descripción de la Ruta:** Obtiene un informe de movimiento de stock para un producto específico por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_producto` (ID del producto).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/informe_movimiento_stock/123
    ```
- **Respuesta Esperada:** Devuelve un informe detallado de los movimientos de stock para el producto en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Informe de Ventas de Productos de un Usuario

- **Descripción de la Ruta:** Obtiene un informe de ventas de productos para un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/informe_movimiento_stock
    ```
- **Respuesta Esperada:** Devuelve un informe detallado de las ventas de productos del usuario en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

## Rutas relacionadas con Productos

### Obtener todos los productos de un usuario

- **Descripción de la Ruta:** Obtiene una lista de todos los productos de un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    curl http://localhost:5200/user/1/product
    ```
- **Respuesta Esperada:** Devuelve una lista de productos en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Obtener un producto por ID de Producto

- **Descripción de la Ruta:** Obtiene un producto específico por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_product` (ID del producto).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    curl http://localhost:5200/user/1/product/123
    ```
- **Respuesta Esperada:** Devuelve los detalles del producto en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Crear un nuevo producto

- **Descripción de la Ruta:** Crea un nuevo producto para un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** POST.
- **Ejemplo de Solicitud:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"nombre_producto":"Nuevo Producto","precio":10.99,"stock":100}' http://localhost:5200/user/1/product
    ```
- **Respuesta Esperada:** Devuelve los detalles del nuevo producto creado en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Actualizar un producto

- **Descripción de la Ruta:** Actualiza los detalles de un producto existente.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_product` (ID del producto).
- **Métodos HTTP Admitidos:** PUT.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_producto":"Manzana","precio":15.99,"stock":75}' http://localhost:5200/user/1/product/123
    ```
- **Respuesta Esperada:** Devuelve los detalles del producto actualizado en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Eliminar un producto (lógico)

- **Descripción de la Ruta:** Marca un producto y sus movimientos de stock como no visibles (eliminación lógica).
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `id_product` (ID del producto).
- **Métodos HTTP Admitidos:** DELETE.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/product/123
    ```
- **Respuesta Esperada:** Indica que el producto y sus movimientos de stock fueron marcados como no visibles.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Ranking de Ventas por Producto

- **Descripción de la Ruta:** Obtiene un ranking de productos por total de ventas.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/product/ranking
    ```
- **Respuesta Esperada:** Devuelve un ranking de productos en formato JSON ordenado por total de ventas.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

## Rutas relacionadas con Servicios

### Obtener todos los servicios de un usuario

- **Descripción de la Ruta:** Obtiene una lista de todos los servicios de un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/services
    ```
- **Respuesta Esperada:** Devuelve una lista de servicios en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Obtener un servicio por ID de un usuario

- **Descripción de la Ruta:** Obtiene un servicio específico por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `service_id` (ID del servicio).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/services/123
    ```
- **Respuesta Esperada:** Devuelve los detalles del servicio en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Modificar un servicio por ID de un usuario

- **Descripción de la Ruta:** Modifica los detalles de un servicio existente.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `service_id` (ID del servicio).
- **Métodos HTTP Admitidos:** PUT.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_servicio":"Servicio Modificado","precio":19.99}' http://localhost:5200/user/1/services/123
    ```
- **Respuesta Esperada:** Devuelve los detalles del servicio actualizado en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Agregar un nuevo servicio a un usuario

- **Descripción de la Ruta:** Agrega un nuevo servicio para un usuario.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** POST.
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_servicio":"Nuevo Servicio","precio":14.99}' http://localhost:5200/user/1/services
    ```
- **Respuesta Esperada:** Devuelve los detalles del nuevo servicio creado en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Eliminar un servicio por ID de un usuario

- **Descripción de la Ruta:** Elimina un servicio por su ID.
- **Parámetros de la Ruta:** `id_user` (ID del usuario), `service_id` (ID del servicio).
- **Métodos HTTP Admitidos:** DELETE.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/services/123
    ```
- **Respuesta Esperada:** Indica que el servicio ha sido eliminado exitosamente.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

### Ranking de Ventas por Servicio

- **Descripción de la Ruta:** Obtiene un ranking de servicios por total de ventas.
- **Parámetros de la Ruta:** `id_user` (ID del usuario).
- **Métodos HTTP Admitidos:** GET.
- **Ejemplo de Solicitud:**
    ```bash
    http://localhost:5200/user/1/ranking/service
    ```
- **Respuesta Esperada:** Devuelve un ranking de servicios en formato JSON ordenado por total de ventas.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.

## Rutas relacionadas con Usuarios y Autenticación

### Crear Usuario

- **Descripción de la Ruta:** Crea un nuevo usuario en espera de activación.
- **Métodos HTTP Admitidos:** POST.
- **Ruta:** `/crearUsuario`
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_usuario":"John Doe","correo_electronico":"john@example.com","contrasena":"password","categoria":"cliente"}' http://localhost:5200/crearUsuario
    ```
- **Respuesta Esperada:** Devuelve un mensaje indicando que el usuario ha sido creado exitosamente y su estado actual (inactivo).

### Iniciar Sesión

- **Descripción de la Ruta:** Inicia sesión y devuelve un token JWT.
- **Métodos HTTP Admitidos:** POST.
- **Ruta:** `/login`
- **Ejemplo de Solicitud:**
    ```bash
    -u john@example.com:password http://localhost:5200/login
    ```
- **Respuesta Esperada:** Devuelve un token JWT válido, junto con el ID del usuario, su categoría y estado.

### Modificar Usuario

- **Descripción de la Ruta:** Modifica los detalles de un usuario existente.
- **Métodos HTTP Admitidos:** PUT.
- **Ruta:** `/user/{id_user}/update`
- **Ejemplo de Solicitud:**
    ```bash
    -H "Content-Type: application/json" -d '{"nombre_usuario":"John Doe","correo_electronico":"john@example.com","contrasena":"new_password"}' http://localhost:5200/user/123/update
    ```
- **Respuesta Esperada:** Devuelve los detalles del usuario actualizados en formato JSON.

### Obtener Usuario

- **Descripción de la Ruta:** Obtiene los detalles de un usuario específico.
- **Métodos HTTP Admitidos:** GET.
- **Ruta:** `/user/{id_user}/get_usuario`
- **Ejemplo de Solicitud:**
    ```bash
    -H "Authorization: Bearer {token}" http://localhost:5200/user/123/get_usuario
    ```
- **Respuesta Esperada:** Devuelve los detalles del usuario en formato JSON.
- **Autenticación:** Se requiere autenticación mediante token JWT en el encabezado.
