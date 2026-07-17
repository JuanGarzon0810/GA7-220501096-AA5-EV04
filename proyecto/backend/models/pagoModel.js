/**
 * pagoModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Pago" (Diagrama de Clases 6:
 * Pago | id:int, fecha:date, total:double, metodo_pago:String),
 * relacionada 1 a 1 con Cita.
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

const SELECT_BASE = `
    SELECT p.id, p.total, p.metodo_pago, p.fecha,
           p.cita_id, cl.nombre AS cliente, s.nombre AS servicio
    FROM pagos p
    INNER JOIN citas c ON c.id = p.cita_id
    INNER JOIN clientes cl ON cl.id = c.cliente_id
    INNER JOIN servicios s ON s.id = c.servicio_id
`;

/** Obtiene todos los pagos registrados. */
async function obtenerPagos() {
    const [filas] = await pool.query(`${SELECT_BASE} ORDER BY p.fecha DESC, p.id DESC`);
    return filas;
}

/** Obtiene un pago por id. */
async function obtenerPagoPorId(id) {
    const [filas] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
    return filas.length > 0 ? filas[0] : null;
}

/** Registra un nuevo pago asociado a una cita (RF20). */
async function crearPago({ citaId, total, metodoPago, fecha }) {
    const [resultado] = await pool.query(
        `INSERT INTO pagos (cita_id, total, metodo_pago, fecha) VALUES (?, ?, ?, ?)`,
        [citaId, total, metodoPago, fecha]
    );
    return resultado.insertId;
}

/** Elimina un pago (por ejemplo, si se registro por error). */
async function eliminarPago(id) {
    const [resultado] = await pool.query(`DELETE FROM pagos WHERE id = ?`, [id]);
    return resultado.affectedRows > 0;
}

/**
 * Calcula el total de ingresos del dia actual (RF21: mostrar
 * ingresos diarios).
 * @param {string} fecha - formato YYYY-MM-DD
 */
async function obtenerIngresosDelDia(fecha) {
    const [filas] = await pool.query(
        `SELECT COALESCE(SUM(total), 0) AS totalDia, COUNT(*) AS cantidadPagos
         FROM pagos WHERE fecha = ?`,
        [fecha]
    );
    return filas[0];
}

module.exports = {
    obtenerPagos,
    obtenerPagoPorId,
    crearPago,
    eliminarPago,
    obtenerIngresosDelDia
};
