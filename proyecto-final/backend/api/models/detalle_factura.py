class DetalleFactura:
    def __init__(self, row):
        self._id_detalle = row[0]
        self._id_factura = row[1]
        self._id_producto = row[2]
        self._id_servicio = row[3]
        self._cantidad = row[4]

    def to_json(self):
        return {
            "id_detalle": self._id_detalle,
            "id_factura": self._id_factura,
            "id_producto": self._id_producto,
            "id_servicio": self._id_servicio,
            "cantidad": self._cantidad
        }
