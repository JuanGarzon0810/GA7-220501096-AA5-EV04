/**
 * servicioController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Servicios.
 *   RF07 - Registrar servicios
 *   RF08 - Editar servicios
 *   RF09 - Eliminar servicios
 *   RF10 - Mostrar precio y duracion de los servicios
 * ------------------------------------------------------------------
 */

const servicioModel = require('../models/servicioModel');

/** Valida los campos obligatorios de un servicio. */
function validarServicio({ nombre, precio, duracion }) {
    if (!nombre || nombre.trim().length < 3) {
        return 'El nombre del servicio debe tener minimo 3 caracteres.';
    }
    if (precio === undefined || precio === null || isNaN(precio) || Number(precio) <= 0) {
        return 'El precio debe ser un numero mayor a cero.';
    }
    if (duracion === undefined || duracion === null || isNaN(duracion) || Number(duracion) <= 0) {
        return 'La duracion debe ser un numero de minutos mayor a cero.';
    }
    return null;
}

/** GET /api/servicios -> lista todos los servicios (RF10). */
async function listarServicios(req, res) {
    try {
        const servicios = await servicioModel.obtenerServicios();
        return res.status(200).json({ ok: true, data: servicios });
    } catch (error) {
        console.error('Error al listar servicios:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los servicios.' });
    }
}

/** GET /api/servicios/:id */
async function obtenerServicio(req, res) {
    try {
        const servicio = await servicioModel.obtenerServicioPorId(req.params.id);
        if (!servicio) {
            return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
        }
        return res.status(200).json({ ok: true, data: servicio });
    } catch (error) {
        console.error('Error al obtener servicio:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el servicio.' });
    }
}

/** POST /api/servicios -> registra un servicio (RF07). */
async function registrarServicio(req, res) {
    try {
        const { nombre, precio, duracion, descripcion } = req.body;
        const errorValidacion = validarServicio({ nombre, precio, duracion });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const nuevoId = await servicioModel.crearServicio({ nombre, precio, duracion, descripcion });
        const servicioCreado = await servicioModel.obtenerServicioPorId(nuevoId);

        return res.status(201).json({
            ok: true,
            mensaje: 'Servicio registrado correctamente.',
            data: servicioCreado
        });
    } catch (error) {
        console.error('Error al registrar servicio:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el servicio.' });
    }
}

/** PUT /api/servicios/:id -> edita un servicio (RF08). */
async function editarServicio(req, res) {
    try {
        const { id } = req.params;
        const { nombre, precio, duracion, descripcion } = req.body;
        const errorValidacion = validarServicio({ nombre, precio, duracion });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const actualizado = await servicioModel.actualizarServicio(id, { nombre, precio, duracion, descripcion });

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
        }

        const servicioActualizado = await servicioModel.obtenerServicioPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Servicio actualizado correctamente.',
            data: servicioActualizado
        });
    } catch (error) {
        console.error('Error al editar servicio:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al editar el servicio.' });
    }
}

/** DELETE /api/servicios/:id -> elimina un servicio (RF09). */
async function eliminarServicio(req, res) {
    try {
        const eliminado = await servicioModel.eliminarServicio(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado.' });
        }
        return res.status(200).json({ ok: true, mensaje: 'Servicio eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error.message);
        // Codigo 1451 de MySQL: violacion de llave foranea (el servicio tiene citas asociadas)
        if (error.errno === 1451) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: el servicio tiene citas asociadas.'
            });
        }
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el servicio.' });
    }
}

module.exports = {
    listarServicios,
    obtenerServicio,
    registrarServicio,
    editarServicio,
    eliminarServicio
};
