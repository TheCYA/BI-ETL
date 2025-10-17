import "dotenv/config";
import Firebird from "node-firebird";
import pkg from "pg";
import format from "pg-format";
import fs from "fs/promises"; 
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración Firebird
const fbOptions = {
  host: process.env.FIREBIRD_HOST,
  port: Number(process.env.FIREBIRD_PORT),
  database: process.env.FIREBIRD_DB,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  role: null,
  pageSize: 4096
};

// Configuración Postgres
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});

async function createSQL(name) {
  const client = await pgPool.connect();
  try {
    const sqlPath = path.join(__dirname, name);
    const sql = await fs.readFile(sqlPath, 'utf-8');
    await client.query(sql);
    console.log(`Archivo SQL ejecutado: ${sqlPath}`);
  } catch (err) {
    console.error('Error ejecutando SQL:', err);
  } finally {
    client.release();
  }
}


await createSQL("create_table.sql");

function queryFirebird(sql) {
  return new Promise((resolve, reject) => {
    Firebird.attach(fbOptions, (err, db) => {
      if (err) return reject(err);
      db.query(sql, (err, result) => {
        if (err) return reject(err);
        db.detach();
        resolve(result);
      });
    });
  });
}

async function loadData() {
  const sql = `
    SELECT a.ARTICULO_ID, a.NOMBRE, a.ESTATUS, a.UNIDAD_VENTA, c.CLAVE_ARTICULO
    FROM ARTICULOS a
    JOIN CLAVES_ARTICULOS c ON a.ARTICULO_ID = c.ARTICULO_ID
  `;

  try {
    const result = await queryFirebird(sql);
    if (result.length === 0) {
      console.log("No se encontraron registros en Firebird.");
      return;
    }

    const client = await pgPool.connect();
    await client.query("BEGIN");

    await client.query("DELETE FROM TABLERO_BI");

    const values = result.map(r => [
      r.ARTICULO_ID,
      r.NOMBRE,
      r.ESTATUS,
      r.UNIDAD_VENTA,
      r.CLAVE_ARTICULO
    ]);

    const insertSQL = format(`
      INSERT INTO TABLERO_BI (articulo_id, nombre, estatus, unidad_venta, clave_articulo)
      VALUES %L
    `, values);

    await client.query(insertSQL);
    await client.query('COMMIT');
    client.release();

    console.log(`Carga completa: ${result.length} registros insertados.`);
    await pgPool.end();
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

loadData();
