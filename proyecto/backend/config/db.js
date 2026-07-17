/**
 * db.js
 * ------------------------------------------------------------------
 * Configura y exporta el pool de conexiones a la base de datos MySQL
 * "barbiere11" utilizando la libreria mysql2/promise.
 *
 * Se usa un "pool" en lugar de una conexion unica para que el backend
 * pueda atender varias peticiones concurrentes sin bloquearse.
 * ------------------------------------------------------------------
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones reutilizable en toda la aplicacion
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'barbiere11',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
