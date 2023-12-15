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