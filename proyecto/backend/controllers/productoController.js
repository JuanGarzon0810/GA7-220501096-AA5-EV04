/**
 * productoController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Inventario.
 *   RF18 - Registrar productos
 *   RF19 - Actualizar stock
 * ------------------------------------------------------------------
 */

const productoModel = require('../models/productoModel');

function validarProducto({ nombre, stock, precio }) {
    if (!nombre || nombre.trim().length < 3) {
        return 'El nombre del producto debe tener minimo 3 caracteres.';
    }
    if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
        return 'El stock debe ser un numero mayor o igual a cero.';
    }
    if (precio === undefined || precio === null || isNaN(precio) || Number(precio) <= 0) {
        return 'El precio debe ser un numero mayor a cero.';
    }
    return null;
}

/** GET /api/productos */
async function listarProductos(req, res) {
    try {
        const productos = await productoModel.obtenerProductos();
        return res.status(200).json({ ok: true, data: productos });
    } catch (error) {
        console.error('Error al listar productos:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el inventario.' });
    }
}

/** GET /api/productos/:id */
async function obtenerProducto(req, res) {
    try {
        const producto = await productoModel.obtenerProductoPorId(req.params.id);
        if (!producto) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
        }
        return res.status(200).json({ ok: true, data: producto });
    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el producto.' });
    }
}

/** POST /api/productos -> RF18 */
async function registrarProducto(req, res) {
    try {
        const { nombre, stock, precio } = req.body;
        const errorValidacion = validarProducto({ nombre, stock, precio });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const nuevoId = await productoModel.crearProducto({ nombre, stock, precio });
        const productoCreado = await productoModel.obtenerProductoPorId(nuevoId);

        return res.status(201).json({
            ok: true,
            mensaje: 'Producto registrado correctamente.',
            data: productoCreado
        });
    } catch (error) {
        console.error('Error al registrar producto:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el producto.' });
    }
}

/** PUT /api/productos/:id -> edita nombre/stock/precio */
async function editarProducto(req, res) {
    try {
        const { id } = req.params;
        const { nombre, stock, precio } = req.body;
        const errorValidacion = validarProducto({ nombre, stock, precio });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const actualizado = await productoModel.actualizarProducto(id, { nombre, stock, precio });

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
        }

        const productoActualizado = await productoModel.obtenerProductoPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado correctamente.',
            data: productoActualizado
        });
    } catch (error) {
        console.error('Error al editar producto:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al editar el producto.' });
    }
}

/**
 * PATCH /api/productos/:id/stock
 * Actualiza unicamente el stock, sumando o restando unidades (RF19).
 * Body esperado: { cantidad: number } (puede ser negativo)
 */
async function actualizarStockProducto(req, res) {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;

        if (cantidad === undefined || isNaN(cantidad) || Number(cantidad) === 0) {
            return res.status(400).json({ ok: false, mensaje: 'Debes indicar una cantidad valida distinta de cero.' });
        }

        const actualizado = await productoModel.actualizarStock(id, Number(cantidad));

        if (!actualizado) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No fue posible actualizar el stock (producto inexistente o stock insuficiente).'
            });
        }

        const productoActualizado = await productoModel.obtenerProductoPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Stock actualizado correctamente.',
            data: productoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al actualizar el stock.' });
    }
}

/** DELETE /api/productos/:id */
async function eliminarProducto(req, res) {
    try {
        const eliminado = await productoModel.eliminarProducto(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
        }
        return res.status(200).json({ ok: true, mensaje: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el producto.' });
    }
}

module.exports = {
    listarProductos,
    obtenerProducto,
    registrarProducto,
    editarProducto,
    actualizarStockProducto,
    eliminarProducto
};
