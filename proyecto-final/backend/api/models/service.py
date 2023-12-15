class Servicio:
    def __init__(self, row):
        self._id = row[0]
        self._nombre_servicio = row[1]
        self._precio = row[2]

    def to_json(self):
        return {
            "id": self._id,
            "nombre_servicio": self._nombre_servicio,
            "precio": self._precio
        }
