from api import app
import mysql.connector

# Configuración de la base de datos
db_config = {
    "host": "localhost",
    "user": "adming",
    "password": "adming",
    "database": "bd2",
}

# Crear una conexión a la base de datos
mysql = mysql.connector.connect(**db_config)