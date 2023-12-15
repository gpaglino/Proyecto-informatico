from api import app
from flask_cors import CORS
import sys

if len(sys.argv) > 1 and sys.argv[1] == "list": #para listar informacion externa a mi aplicacion
    print(app.url_map)
elif __name__ == "__main__":
    CORS(app)
    app.run( debug=True, port= 5200)
