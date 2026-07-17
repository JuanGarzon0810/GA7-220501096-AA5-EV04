/**
 * servicioModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Servicio" (Diagrama de Clases 3:
 * Servicio | id:int, nombre:String, precio:double, duracion:String,
 * descripcion:String).
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/** Obtiene todos los servicios ordenados por nombre. */
async function obtenerServicios() {
    const [filas] = await pool.query(
        `SELECT id, nombre, precio, duracion, descripcion FROM servicios ORDER BY nombre ASC`
    );
    return filas;
}

/** Obtiene un servicio por id. */
async function obtenerServicioPorId(id) {
    const [filas] = await pool.query(
        `SELECT id, nombre, precio, duracion, descripcion FROM servicios WHERE id = ?`,
        [id]
    );
    return filas.length > 0 ? filas[0] : null;
}

/** Registra un nuevo servicio (RF07). */
async function crearServicio({ nombre, precio, duracion, descripcion }) {
    const [resultado] = await pool.query(
        `INSERT INTO servicios (nombre, precio, duracion, descripcion) VALUES (?, ?, ?, ?)`,
        [nombre, precio, duracion, descripcion || null]
    );
    return resultado.insertId;
}

/** Edita un servicio existente (RF08). */
async function actualizarServicio(id, { nombre, precio, duracion, descripcion }) {
    const [resultado] = await pool.query(
        `UPDATE servicios SET nombre = ?, precio = ?, duracion = ?, descripcion = ? WHERE id = ?`,
        [nombre, precio, duracion, descripcion || null, id]
    );
    return resultado.affectedRows > 0;
}

/** Elimina un servicio (RF09). */
async function eliminarServicio(id) {
    const [resultado] = await pool.query(`DELETE FROM servicios WHERE id = ?`, [id]);
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerServicios,
    obtenerServicioPorId,
    crearServicio,
    actualizarServicio,
    eliminarServicio
};
