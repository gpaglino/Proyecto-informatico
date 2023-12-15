class Factura:
    def __init__(self, row):
        self._id_factura = row[0]
        self._id_cliente = row[1]
        self._id_usuario = row[2]
        self._fecha = row[3]
                
    def to_json(self):
        return {
            "id_factura": self._id_factura,
            "id_cliente": self._id_cliente,
            "id_usuario": self._id_usuario,
            "fecha": self._fecha.strftime('%Y-%m-%d'),
        }
