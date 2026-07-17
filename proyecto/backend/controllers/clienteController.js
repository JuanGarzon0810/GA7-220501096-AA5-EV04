/**
 * clienteController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Clientes.
 * Contiene la logica de negocio para cada requisito funcional:
 *   RF03 - Registrar clientes
 *   RF04 - Editar clientes
 *   RF05 - Eliminar clientes
 *   RF06 - Buscar clientes
 *
 * Cada funcion corresponde a una ruta HTTP definida en
 * clienteRoutes.js y sigue el flujo descrito en el
 * Diagrama de Secuencia y el Diagrama de Actividades del proyecto.
 * ------------------------------------------------------------------
 */

const clienteModel = require('../models/clienteModel');

/**
 * Valida los campos obligatorios de un cliente.
 * @param {Object} datos
 * @returns {string|null} mensaje de error o null si es valido
 */
function validarCliente({ nombre, telefono }) {
    if (!nombre || nombre.trim().length < 3) {
        return 'El nombre del cliente debe tener minimo 3 caracteres.';
    }
    if (!telefono || !/^[0-9+\s-]{7,20}$/.test(telefono)) {
        return 'El telefono ingresado no es valido.';
    }
    return null;
}

/**
 * GET /api/clientes
 * Lista todos los clientes. Admite ?buscar= para filtrar (RF06).
 */
async function listarClientes(req, res) {
    try {
        const busqueda = req.query.buscar || '';
        const clientes = await clienteModel.obtenerClientes(busqueda);
        return res.status(200).json({ ok: true, data: clientes });
    } catch (error) {
        console.error('Error al listar clientes:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los clientes.' });
    }
}

/**
 * GET /api/clientes/:id
 * Obtiene el detalle de un cliente especifico.
 */
async function obtenerCliente(req, res) {
    try {
        const { id } = req.params;
        const cliente = await clienteModel.obtenerClientePorId(id);

        if (!cliente) {
            return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado.' });
        }
        return res.status(200).json({ ok: true, data: cliente });
    } catch (error) {
        console.error('Error al obtener cliente:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el cliente.' });
    }
}

/**
 * POST /api/clientes
 * Registra un nuevo cliente (RF03 / Historia de Usuario 2).
 */
async function registrarCliente(req, res) {
    try {
        const { nombre, telefono, correo } = req.body;
        const errorValidacion = validarCliente({ nombre, telefono });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const nuevoId = await clienteModel.crearCliente({ nombre, telefono, correo });
        const clienteCreado = await clienteModel.obtenerClientePorId(nuevoId);

        return res.status(201).json({
            ok: true,
            mensaje: 'Cliente registrado correctamente.',
            data: clienteCreado
        });
    } catch (error) {
        console.error('Error al registrar cliente:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el cliente.' });
    }
}

/**
 * PUT /api/clientes/:id
 * Edita la informacion de un cliente existente (RF04).
 */
async function editarCliente(req, res) {
    try {
        const { id } = req.params;
        const { nombre, telefono, correo } = req.body;
        const errorValidacion = validarCliente({ nombre, telefono });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const actualizado = await clienteModel.actualizarCliente(id, { nombre, telefono, correo });

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado.' });
        }

        const clienteActualizado = await clienteModel.obtenerClientePorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Cliente actualizado correctamente.',
            data: clienteActualizado
        });
    } catch (error) {
        console.error('Error al editar cliente:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al editar el cliente.' });
    }
}

/**
 * DELETE /api/clientes/:id
 * Elimina un cliente del sistema (RF05).
 */
async function eliminarCliente(req, res) {
    try {
        const { id } = req.params;
        const eliminado = await clienteModel.eliminarCliente(id);

        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado.' });
        }

        return res.status(200).json({ ok: true, mensaje: 'Cliente eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el cliente.' });
    }
}

module.exports = {
    listarClientes,
    obtenerCliente,
    registrarCliente,
    editarCliente,
    eliminarCliente
};
