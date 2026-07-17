/**
 * usuarioModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Usuario" (ver Diagrama de Clases 1:
 * Usuario | id:int, nombre:String, correo:String, password:String,
 * rol:String).
 *
 * Se encarga unicamente de las consultas SQL relacionadas con la
 * tabla "usuarios". La logica de autenticacion (comparar password,
 * generar token) vive en el controlador.
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/**
 * Busca un usuario por su correo electronico.
 * @param {string} correo
 * @returns {Promise<Object|null>}
 */
async function obtenerUsuarioPorCorreo(correo) {
    const [filas] = await pool.query(
        `SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ?`,
        [correo]
    );
    return filas.length > 0 ? filas[0] : null;
}

/**
 * Obtiene un usuario por id (sin exponer la contrasena).
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function obtenerUsuarioPorId(id) {
    const [filas] = await pool.query(
        `SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?`,
        [id]
    );
    return filas.length > 0 ? filas[0] : null;
}

module.exports = {
    obtenerUsuarioPorCorreo,
    obtenerUsuarioPorId
};
