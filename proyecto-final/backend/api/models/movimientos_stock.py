class MovimientoStock:
    def __init__(self, row):
        self._id_movimiento = row[0]
        self._cantidad_vendida = row[1]
        self._fecha = row[2]
        self._id_producto = row[3]
        self._stock = row[4]
        self._stock_inicial = row[5]
        self._id_factura = row[6]
        self._tipo_movimiento = row[7]

    def to_json(self):
        return {
            "id_movimiento": self._id_movimiento,
            "cantidad_vendida": self._cantidad_vendida,
            "fecha": str(self._fecha),
            "id_producto": self._id_producto,
            "stock": self._stock,
            "stock_inicial": self._stock_inicial,
            "id_factura": self._id_factura,
            "tipo_movimiento": self._tipo_movimiento 
        }