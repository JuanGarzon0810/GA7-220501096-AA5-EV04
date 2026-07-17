/**
 * clienteModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Cliente" (ver Diagrama de Clases 2:
 * Cliente | id:int, nombre:String, telefono:String, correo:String).
 *
 * Aqui se centralizan todas las consultas SQL relacionadas con la
 * tabla "clientes". Los controladores NUNCA deben escribir SQL
 * directamente, siempre deben usar estas funciones.
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/**
 * Obtiene todos los clientes registrados.
 * Si se recibe un termino de busqueda, filtra por nombre o telefono
 * (RF06: El sistema debe permitir buscar clientes).
 * @param {string} busqueda - texto opcional de busqueda
 * @returns {Promise<Array>} lista de clientes
 */
async function obtenerClientes(busqueda = '') {
    if (busqueda) {
        const like = `%${busqueda}%`;
        const [filas] = await pool.query(
            `SELECT id, nombre, telefono, correo, creado_en
             FROM clientes
             WHERE nombre LIKE ? OR telefono LIKE ?
             ORDER BY nombre ASC`,
            [like, like]
        );
        return filas;
    }

    const [filas] = await pool.query(
        `SELECT id, nombre, telefono, correo, creado_en
         FROM clientes
         ORDER BY nombre ASC`
    );
    return filas;
}

/**
 * Obtiene un cliente por su id.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function obtenerClientePorId(id) {
    const [filas] = await pool.query(
        `SELECT id, nombre, telefono, correo, creado_en
         FROM clientes WHERE id = ?`,
        [id]
    );
    return filas.length > 0 ? filas[0] : null;
}

/**
 * Registra un nuevo cliente (RF03).
 * @param {Object} cliente - { nombre, telefono, correo }
 * @returns {Promise<number>} id del cliente insertado
 */
async function crearCliente({ nombre, telefono, correo }) {
    const [resultado] = await pool.query(
        `INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)`,
        [nombre, telefono, correo || null]
    );
    return resultado.insertId;
}

/**
 * Edita un cliente existente (RF04).
 * @param {number} id
 * @param {Object} cliente - { nombre, telefono, correo }
 * @returns {Promise<boolean>} true si se actualizo un registro
 */
async function actualizarCliente(id, { nombre, telefono, correo }) {
    const [resultado] = await pool.query(
        `UPDATE clientes SET nombre = ?, telefono = ?, correo = ? WHERE id = ?`,
        [nombre, telefono, correo || null, id]
    );
    return resultado.affectedRows > 0;
}

/**
 * Elimina un cliente por id (RF05).
 * @param {number} id
 * @returns {Promise<boolean>} true si se elimino un registro
 */
async function eliminarCliente(id) {
    const [resultado] = await pool.query(
        `DELETE FROM clientes WHERE id = ?`,
        [id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
