class Usuario:
    def __init__(self, row):
        self._id = row[0]
        self._nombre_usuario = row[1]
        self._correo_electronico = row[2]
        self._contrasena = row[3]
        self._categoria = row[4]

    def to_json(self):
        return {
            "id": self._id,
            "nombre": self._nombre_usuario,
            "correo_electronico": self._correo_electronico,
            "contrasena": self._contrasena,
            "categoria" : self._categoria,
        }
