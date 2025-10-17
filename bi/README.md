## Configuración del .env
1. En FIREBIRD_DB, agregar la dirección del archivo .FDB de la base de datos de firebird
2. En POSTGRES_DB, POSTGRES_USER y POSTGRES_PASSWORD configurar los valores correctos para el caso, la base de datos, el usuario y la contraseña respectivamente.

## Creación de la tabla
---
La tabla sql se crea automaticamente al ejecutar el script, si los datos da la base de datos de postgresql fueron correctos, se hará la conexión automatica y creará la tabla en la base de datos seleccionada.

## Carga de datos
--
La carga de datos se realiza al ejecutar el siguiente comando en la consola en la raiz del proyecto:
```
node bi/load_data.js
```
Este script crea la tabla y posteriormente hace la conexión a firebird, realiza la consulta, se guarda temporalmente en "values" en memoria y posteriormente con la conexión a postgresql, se insertan los datos.

## Vaidación
en postgresql se pueden validar los datos cargados, ya sea desde el CLI o desde una administrador gráfico como pgAdmin
-- Contar registros
SELECT COUNT(*) FROM TABLERO_BI;

-- Ver los primeros 10 registros
SELECT * FROM TABLERO_BI LIMIT 10;
