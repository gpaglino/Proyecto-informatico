class Producto:
    def __init__(self, row):
        self._id = row[0]
        self._nombre_producto = row[1]
        self._precio = row[2]
        self._stock = row[3]

    def to_json(self):
        return {
            "id": self._id,
            "nombre_producto": self._nombre_producto,
            "precio": self._precio,
            "stock": self._stock
        }
