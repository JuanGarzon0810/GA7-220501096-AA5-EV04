/**
 * barberoModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Barbero" (Diagrama de Clases 4:
 * Barbero | id:int, nombre:String, especialidad:String,
 * telefono:String).
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/** Obtiene todos los barberos registrados. */
async function obtenerBarberos() {
    const [filas] = await pool.query(
        `SELECT id, nombre, especialidad, telefono FROM barberos ORDER BY nombre ASC`
    );
    return filas;
}

/** Obtiene un barbero por id. */
async function obtenerBarberoPorId(id) {
    const [filas] = await pool.query(
        `SELECT id, nombre, especialidad, telefono FROM barberos WHERE id = ?`,
        [id]
    );
    return filas.length > 0 ? filas[0] : null;
}

/** Registra un nuevo barbero (RF16). */
async function crearBarbero({ nombre, especialidad, telefono }) {
    const [resultado] = await pool.query(
        `INSERT INTO barberos (nombre, especialidad, telefono) VALUES (?, ?, ?)`,
        [nombre, especialidad || null, telefono || null]
    );
    return resultado.insertId;
}

/** Edita un barbero existente. */
async function actualizarBarbero(id, { nombre, especialidad, telefono }) {
    const [resultado] = await pool.query(
        `UPDATE barberos SET nombre = ?, especialidad = ?, telefono = ? WHERE id = ?`,
        [nombre, especialidad || null, telefono || null, id]
    );
    return resultado.affectedRows > 0;
}

/** Elimina un barbero. */
async function eliminarBarbero(id) {
    const [resultado] = await pool.query(`DELETE FROM barberos WHERE id = ?`, [id]);
    return resultado.affectedRows > 0;
}

/**
 * Obtiene las citas asignadas a un barbero especifico (RF17).
 * Se hace JOIN con clientes y servicios para mostrar informacion legible.
 * @param {number} barberoId
 */
async function obtenerCitasDelBarbero(barberoId) {
    const [filas] = await pool.query(
        `SELECT c.id, cl.nombre AS cliente, s.nombre AS servicio,
                c.fecha, c.hora, c.estado
         FROM citas c
         INNER JOIN clientes cl ON cl.id = c.cliente_id
         INNER JOIN servicios s ON s.id = c.servicio_id
         WHERE c.barbero_id = ?
         ORDER BY c.fecha ASC, c.hora ASC`,
        [barberoId]
    );
    return filas;
}

module.exports = {
    obtenerBarberos,
    obtenerBarberoPorId,
    crearBarbero,
    actualizarBarbero,
    eliminarBarbero,
    obtenerCitasDelBarbero
};
