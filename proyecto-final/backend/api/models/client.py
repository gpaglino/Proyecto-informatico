class Cliente:
    def __init__(self, row):
        self._id = row[0]
        self._nombre_cliente = row[1]
        self._direccion = row[2]
        self._telefono = row[3]
        self._correo_electronico = row[4]
        self._dni = row [5]

    def to_json(self):
        return {
            "id": self._id,
            "nombre_cliente": self._nombre_cliente,
            "direccion": self._direccion,
            "telefono": self._telefono,
            "correo_electronico": self._correo_electronico,
            "dni" : self._dni
        }

