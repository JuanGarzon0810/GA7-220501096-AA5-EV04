/**
 * barberoController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Barberos.
 *   RF16 - Registrar barberos
 *   RF17 - Mostrar citas asignadas a cada barbero
 * ------------------------------------------------------------------
 */

const barberoModel = require('../models/barberoModel');

function validarBarbero({ nombre }) {
    if (!nombre || nombre.trim().length < 3) {
        return 'El nombre del barbero debe tener minimo 3 caracteres.';
    }
    return null;
}

/** GET /api/barberos */
async function listarBarberos(req, res) {
    try {
        const barberos = await barberoModel.obtenerBarberos();
        return res.status(200).json({ ok: true, data: barberos });
    } catch (error) {
        console.error('Error al listar barberos:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los barberos.' });
    }
}

/** GET /api/barberos/:id */
async function obtenerBarbero(req, res) {
    try {
        const barbero = await barberoModel.obtenerBarberoPorId(req.params.id);
        if (!barbero) {
            return res.status(404).json({ ok: false, mensaje: 'Barbero no encontrado.' });
        }
        return res.status(200).json({ ok: true, data: barbero });
    } catch (error) {
        console.error('Error al obtener barbero:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el barbero.' });
    }
}

/** POST /api/barberos -> RF16 */
async function registrarBarbero(req, res) {
    try {
        const { nombre, especialidad, telefono } = req.body;
        const errorValidacion = validarBarbero({ nombre });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const nuevoId = await barberoModel.crearBarbero({ nombre, especialidad, telefono });
        const barberoCreado = await barberoModel.obtenerBarberoPorId(nuevoId);

        return res.status(201).json({
            ok: true,
            mensaje: 'Barbero registrado correctamente.',
            data: barberoCreado
        });
    } catch (error) {
        console.error('Error al registrar barbero:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el barbero.' });
    }
}

/** PUT /api/barberos/:id */
async function editarBarbero(req, res) {
    try {
        const { id } = req.params;
        const { nombre, especialidad, telefono } = req.body;
        const errorValidacion = validarBarbero({ nombre });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const actualizado = await barberoModel.actualizarBarbero(id, { nombre, especialidad, telefono });

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Barbero no encontrado.' });
        }

        const barberoActualizado = await barberoModel.obtenerBarberoPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Barbero actualizado correctamente.',
            data: barberoActualizado
        });
    } catch (error) {
        console.error('Error al editar barbero:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al editar el barbero.' });
    }
}

/** DELETE /api/barberos/:id */
async function eliminarBarbero(req, res) {
    try {
        const eliminado = await barberoModel.eliminarBarbero(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Barbero no encontrado.' });
        }
        return res.status(200).json({ ok: true, mensaje: 'Barbero eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar barbero:', error.message);
        if (error.errno === 1451) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: el barbero tiene citas asociadas.'
            });
        }
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el barbero.' });
    }
}

/** GET /api/barberos/:id/citas -> RF17 */
async function listarCitasDelBarbero(req, res) {
    try {
        const barbero = await barberoModel.obtenerBarberoPorId(req.params.id);
        if (!barbero) {
            return res.status(404).json({ ok: false, mensaje: 'Barbero no encontrado.' });
        }

        const citas = await barberoModel.obtenerCitasDelBarbero(req.params.id);
        return res.status(200).json({ ok: true, data: citas });
    } catch (error) {
        console.error('Error al listar citas del barbero:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener las citas del barbero.' });
    }
}

module.exports = {
    listarBarberos,
    obtenerBarbero,
    registrarBarbero,
    editarBarbero,
    eliminarBarbero,
    listarCitasDelBarbero
};
