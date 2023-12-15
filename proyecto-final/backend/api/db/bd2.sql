-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS `bd2`;
USE `bd2`;

-- Crear la tabla `usuarios`
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `estado_usuario` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `unique_email` (`correo_electronico`)
);

-- Crear la tabla `clientes`
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_cliente` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `dni` varchar(8) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `dni` (`dni`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
);

-- Crear la tabla `servicios`
CREATE TABLE `servicios` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_servicio` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_servicio`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
);

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `stock_inicial` int(11) DEFAULT NULL,  -- Nueva columna
  `id_usuario` int(11) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_producto`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
);


-- Crear la tabla `factura`
CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_factura`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
);

-- Crear la tabla `detalle_factura`
CREATE TABLE `detalle_factura` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_detalle`),
  KEY `id_factura` (`id_factura`),
  KEY `id_producto` (`id_producto`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `detalle_factura_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`),
  CONSTRAINT `detalle_factura_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `detalle_factura_ibfk_3` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`)
);

-- Crear la tabla `movimientos_stock`
CREATE TABLE `movimientos_stock` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad_vendida` int(11),
  `fecha` date,
  `id_producto` int(11),
  `stock` int(11),
  `stock_inicial` int(11),
  `id_factura` int(11),
  `tipo_movimiento` int(11),
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_producto` (`id_producto`),
  KEY `id_factura` (`id_factura`),
  CONSTRAINT `movimientos_stock_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `movimientos_stock_ibfk_2` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`)
);


-- Establecer valores autoincrementales
ALTER TABLE `usuarios` AUTO_INCREMENT = 1;
ALTER TABLE `clientes` AUTO_INCREMENT = 1;
ALTER TABLE `servicios` AUTO_INCREMENT = 1;
ALTER TABLE `productos` AUTO_INCREMENT = 1;
ALTER TABLE `factura` AUTO_INCREMENT = 1;
ALTER TABLE `detalle_factura` AUTO_INCREMENT = 1;
ALTER TABLE `movimientos_stock` AUTO_INCREMENT = 1;


-- Insertar usuarios de ejemplo
INSERT INTO `usuarios` (`nombre_usuario`, `correo_electronico`, `contrasena`, `categoria`, `estado_usuario`)
VALUES
('EjemploUsuarioA', 'ejemploA@example.com', 'contrasenaA', 'A', 1),
('EjemploUsuarioB', 'ejemploB@example.com', 'contrasenaB', 'B', 1),
('EjemploUsuarioC', 'ejemploC@example.com', 'contrasenaC', 'C', 1);

-- Insertar clientes de ejemplo para cada usuario
INSERT INTO `clientes` (`nombre_cliente`, `direccion`, `telefono`, `correo_electronico`, `dni`, `id_usuario`, `visible`)
VALUES
-- Cliente para Usuario A
('ClienteA1', 'DirecciónA1', '555-1111', 'clienteA1@example.com', '11111111', 1, 1),
('ClienteA2', 'DirecciónA2', '555-2222', 'clienteA2@example.com', '22222222', 1, 1),
('ClienteA3', 'DirecciónA3', '555-3333', 'clienteA3@example.com', '33333333', 1, 1),
('ClienteA4', 'DirecciónA4', '555-4444', 'clienteA4@example.com', '44444444', 1, 1),
('ClienteA5', 'DirecciónA5', '555-5555', 'clienteA5@example.com', '55555555', 1, 1),

-- Cliente para Usuario B
('ClienteB1', 'DirecciónB1', '555-4444', 'clienteB1@example.com', '14444444', 2, 1),
('ClienteB2', 'DirecciónB2', '555-5555', 'clienteB2@example.com', '55355555', 2, 1),
('ClienteB3', 'DirecciónB3', '555-6666', 'clienteB3@example.com', '66662666', 2, 1),
('ClienteB4', 'DirecciónB4', '555-6666', 'clienteB4@example.com', '66666666', 2, 1),
('ClienteB5', 'DirecciónB5', '555-7777', 'clienteB5@example.com', '77777877', 2, 1),

-- Cliente para Usuario C
('ClienteC1', 'DirecciónC1', '555-7777', 'clienteC1@example.com', '77777777', 3, 1),
('ClienteC2', 'DirecciónC2', '555-8888', 'clienteC2@example.com', '88888888', 3, 1),
('ClienteC3', 'DirecciónC3', '555-9999', 'clienteC3@example.com', '99999599', 3, 1),
('ClienteC4', 'DirecciónC4', '555-8888', 'clienteC4@example.com', '88288888', 3, 1),
('ClienteC5', 'DirecciónC5', '555-9999', 'clienteC5@example.com', '99999999', 3, 1);

-- Insertar servicios de ejemplo para cada usuario
INSERT INTO `servicios` (`nombre_servicio`, `precio`, `id_usuario`, `visible`)
VALUES
-- Servicios para Usuario A
('ServicioA1', 50.00, 1, 1),
('ServicioA2', 60.00, 1, 1),
('ServicioA3', 70.00, 1, 1),
('ServicioA4', 80.00, 1, 1),
('ServicioA5', 90.00, 1, 1),

-- Servicios para Usuario B
('ServicioB1', 55.00, 2, 1),
('ServicioB2', 65.00, 2, 1),
('ServicioB3', 75.00, 2, 1),
('ServicioB4', 85.00, 2, 1),
('ServicioB5', 95.00, 2, 1),

-- Servicios para Usuario C
('ServicioC1', 45.00, 3, 1),
('ServicioC2', 55.00, 3, 1),
('ServicioC3', 65.00, 3, 1),
('ServicioC4', 75.00, 3, 1),
('ServicioC5', 85.00, 3, 1);

-- Insertar productos de ejemplo para cada usuario
INSERT INTO `productos` (`nombre_producto`, `precio`, `stock`, `stock_inicial`, `id_usuario`, `visible`)
VALUES
-- Productos para Usuario A
('ProductoA1', 10.99, 20, 20, 1, 1),
('ProductoA2', 15.99, 15, 15, 1, 1),
('ProductoA3', 20.99, 10, 10, 1, 1),
('ProductoA4', 25.99, 5, 5, 1, 1),
('ProductoA5', 30.99, 0, 0, 1, 1),
('ProductoA6', 35.99, 10, 10, 1, 1),
('ProductoA7', 40.99, 15, 15, 1, 1),
('ProductoA8', 45.99, 20, 20, 1, 1),
('ProductoA9', 50.99, 15, 15, 1, 1),
('ProductoA10', 55.99, 10, 10, 1, 1),

-- Productos para Usuario B
('ProductoB1', 12.50, 25, 25, 2, 1),
('ProductoB2', 18.75, 18, 18, 2, 1),
('ProductoB3', 24.99, 12, 12, 2, 1),
('ProductoB4', 28.50, 7, 7, 2, 1),
('ProductoB5', 33.75, 2, 2, 2, 1),
('ProductoB6', 38.75, 12, 12, 2, 1),
('ProductoB7', 43.75, 17, 17, 2, 1),
('ProductoB8', 48.50, 25, 25, 2, 1),
('ProductoB9', 53.75, 18, 18, 2, 1),
('ProductoB10', 58.99, 12, 12, 2, 1),

-- Productos para Usuario C
('ProductoC1', 8.99, 30, 30, 3, 1),
('ProductoC2', 13.50, 22, 22, 3, 1),
('ProductoC3', 19.99, 15, 15, 3, 1),
('ProductoC4', 22.99, 10, 10, 3, 1),
('ProductoC5', 27.50, 5, 5, 3, 1),
('ProductoC6', 32.50, 15, 15, 3, 1),
('ProductoC7', 37.50, 20, 20, 3, 1),
('ProductoC8', 42.99, 30, 30, 3, 1),
('ProductoC9', 47.50, 22, 22, 3, 1),
('ProductoC10', 52.50, 15, 15, 3, 1);


-- Insertar facturas de ejemplo
INSERT INTO `factura` (`id_cliente`, `id_usuario`, `fecha`, `visible`)
VALUES
(1, 1, '2023-12-03', 1),  -- Factura para el cliente con id_cliente 1, creado por usuario con id_usuario 1
(2, 1, '2023-12-04', 1),  -- Factura para el cliente con id_cliente 2
(3, 1, '2023-12-05', 1);  -- Factura para el cliente con id_cliente 3

-- Insertar detalles de factura de ejemplo
-- Asegúrate de que los `id_producto` correspondan a los productos que existen en tu base de datos
INSERT INTO `detalle_factura` (`id_factura`, `id_producto`, `cantidad`, `subtotal`, `visible`)
VALUES
(1, 1, 2, 21.98, 1),   -- 2 unidades del producto con id_producto 1 para la factura con id_factura 1
(1, 2, 1, 15.99, 1),   -- 1 unidad del producto con id_producto 2 para la misma factura
(2, 3, 3, 62.97, 1),   -- 3 unidades del producto con id_producto 3 para la factura con id_factura 2
(3, 4, 1, 25.99, 1);   -- 1 unidad del producto con id_producto 4 para la factura con id_factura 3

-- Insertar movimientos de stock correspondientes a las facturas de ejemplo
-- Asegúrate de que los `id_producto` correspondan a los productos y que los `stock` y `stock_inicial` sean coherentes con los valores actuales
INSERT INTO `movimientos_stock` (`cantidad_vendida`, `fecha`, `id_producto`, `stock`, `stock_inicial`, `id_factura`, `tipo_movimiento`, `visible`)
VALUES
(2, '2023-12-03', 1, 18, 20, 1, 2, 1),   -- Venta de 2 unidades del producto 1
(1, '2023-12-03', 2, 14, 15, 1, 2, 1),   -- Venta de 1 unidad del producto 2
(3, '2023-12-04', 3, 7, 10, 2, 2, 1),    -- Venta de 3 unidades del producto 3
(1, '2023-12-05', 4, 4, 5, 3, 2, 1);     -- Venta de 1 unidad del producto 4
