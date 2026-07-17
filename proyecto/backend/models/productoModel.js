/**
 * productoModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Producto" (Diagrama de Clases 7:
 * Producto | id:int, nombre:String, stock:int, precio:double).
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/** Obtiene todos los productos del inventario. */
async function obtenerProductos() {
    const [filas] = await pool.query(
        `SELECT id, nombre, stock, precio FROM productos ORDER BY nombre ASC`
    );
    return filas;
}

/** Obtiene un producto por id. */
async function obtenerProductoPorId(id) {
    const [filas] = await pool.query(
        `SELECT id, nombre, stock, precio FROM productos WHERE id = ?`,
        [id]
    );
    return filas.length > 0 ? filas[0] : null;
}

/** Registra un nuevo producto (RF18). */
async function crearProducto({ nombre, stock, precio }) {
    const [resultado] = await pool.query(
        `INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)`,
        [nombre, stock, precio]
    );
    return resultado.insertId;
}

/** Edita la informacion general de un producto. */
async function actualizarProducto(id, { nombre, stock, precio }) {
    const [resultado] = await pool.query(
        `UPDATE productos SET nombre = ?, stock = ?, precio = ? WHERE id = ?`,
        [nombre, stock, precio, id]
    );
    return resultado.affectedRows > 0;
}

/**
 * Actualiza unicamente el stock de un producto (RF19).
 * Se usa una operacion relativa (sumar/restar) para evitar condiciones
 * de carrera si dos usuarios actualizan el inventario al mismo tiempo.
 * @param {number} id
 * @param {number} cantidad - positivo para sumar, negativo para restar
 */
async function actualizarStock(id, cantidad) {
    const [resultado] = await pool.query(
        `UPDATE productos SET stock = stock + ? WHERE id = ? AND stock + ? >= 0`,
        [cantidad, id, cantidad]
    );
    return resultado.affectedRows > 0;
}

/** Elimina un producto del inventario. */
async function eliminarProducto(id) {
    const [resultado] = await pool.query(`DELETE FROM productos WHERE id = ?`, [id]);
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    actualizarStock,
    eliminarProducto
};
