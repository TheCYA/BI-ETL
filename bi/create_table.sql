CREATE TABLE IF NOT EXISTS TABLERO_BI (
    articulo_id INT NOT NULL,
    nombre VARCHAR(255),
    estatus VARCHAR(50),
    unidad_venta VARCHAR(50),
    clave_articulo VARCHAR(50) NOT NULL,
    PRIMARY KEY (articulo_id, clave_articulo)
);
