/**
 * citaController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Citas.
 *   RF11 - Registrar citas
 *   RF12 - Asociar servicios a las citas
 *   RF13 - Editar citas
 *   RF14 - Cancelar citas
 *   RF15 - Mostrar citas diarias
 *
 * Sigue el Diagrama de Actividades 2 (Registrar cita): ingresar datos
 * -> validar disponibilidad -> guardar o mostrar horario no disponible.
 * ------------------------------------------------------------------
 */

const citaModel = require('../models/citaModel');

const ESTADOS_VALIDOS = ['pendiente', 'en_proceso', 'finalizada', 'cancelada'];

/** Valida los campos obligatorios de una cita. */
function validarCita({ clienteId, servicioId, barberoId, fecha, hora }) {
    if (!clienteId || !servicioId || !barberoId) {
        return 'Debes seleccionar cliente, servicio y barbero.';
    }
    if (!fecha || isNaN(Date.parse(fecha))) {
        return 'La fecha de la cita no es valida.';
    }
    if (!hora || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
        return 'La hora de la cita no es valida (formato HH:MM).';
    }
    return null;
}

/**
 * GET /api/citas
 * Lista todas las citas. Admite ?fecha=YYYY-MM-DD para
 * mostrar solo las citas de un dia (RF15).
 */
async function listarCitas(req, res) {
    try {
        const fecha = req.query.fecha || '';
        const citas = await citaModel.obtenerCitas(fecha);
        return res.status(200).json({ ok: true, data: citas });
    } catch (error) {
        console.error('Error al listar citas:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener las citas.' });
    }
}

/** GET /api/citas/:id */
async function obtenerCita(req, res) {
    try {
        const cita = await citaModel.obtenerCitaPorId(req.params.id);
        if (!cita) {
            return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
        }
        return res.status(200).json({ ok: true, data: cita });
    } catch (error) {
        console.error('Error al obtener cita:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener la cita.' });
    }
}

/**
 * POST /api/citas
 * Registra una nueva cita (RF11, RF12), validando que el barbero
 * no tenga ya una cita en el mismo horario.
 */
async function registrarCita(req, res) {
    try {
        const { clienteId, servicioId, barberoId, fecha, hora } = req.body;
        const errorValidacion = validarCita({ clienteId, servicioId, barberoId, fecha, hora });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const horarioOcupado = await citaModel.existeCruceDeHorario({ barberoId, fecha, hora });

        if (horarioOcupado) {
            return res.status(409).json({
                ok: false,
                mensaje: 'El barbero seleccionado ya tiene una cita en ese horario.'
            });
        }

        const nuevoId = await citaModel.crearCita({ clienteId, servicioId, barberoId, fecha, hora });
        const citaCreada = await citaModel.obtenerCitaPorId(nuevoId);

        return res.status(201).json({
            ok: true,
            mensaje: 'Cita registrada correctamente.',
            data: citaCreada
        });
    } catch (error) {
        console.error('Error al registrar cita:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar la cita.' });
    }
}

/**
 * PUT /api/citas/:id
 * Edita una cita existente (RF13), validando de nuevo la disponibilidad
 * del horario (excluyendo la cita actual de la validacion).
 */
async function editarCita(req, res) {
    try {
        const { id } = req.params;
        const { clienteId, servicioId, barberoId, fecha, hora } = req.body;
        const errorValidacion = validarCita({ clienteId, servicioId, barberoId, fecha, hora });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        const horarioOcupado = await citaModel.existeCruceDeHorario({
            barberoId, fecha, hora, idExcluir: id
        });

        if (horarioOcupado) {
            return res.status(409).json({
                ok: false,
                mensaje: 'El barbero seleccionado ya tiene otra cita en ese horario.'
            });
        }

        const actualizado = await citaModel.actualizarCita(id, { clienteId, servicioId, barberoId, fecha, hora });

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
        }

        const citaActualizada = await citaModel.obtenerCitaPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Cita actualizada correctamente.',
            data: citaActualizada
        });
    } catch (error) {
        console.error('Error al editar cita:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al editar la cita.' });
    }
}

/**
 * PATCH /api/citas/:id/estado
 * Cambia el estado de una cita. Se usa tanto para RF14 (cancelar)
 * como para el caso de uso "Cambiar estado de atencion" del barbero.
 */
async function cambiarEstadoCita(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: `Estado invalido. Los valores permitidos son: ${ESTADOS_VALIDOS.join(', ')}.`
            });
        }

        const actualizado = await citaModel.actualizarEstadoCita(id, estado);

        if (!actualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
        }

        const citaActualizada = await citaModel.obtenerCitaPorId(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Estado de la cita actualizado correctamente.',
            data: citaActualizada
        });
    } catch (error) {
        console.error('Error al cambiar estado de la cita:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al actualizar el estado de la cita.' });
    }
}

/** DELETE /api/citas/:id -> elimina definitivamente una cita. */
async function eliminarCita(req, res) {
    try {
        const eliminado = await citaModel.eliminarCita(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada.' });
        }
        return res.status(200).json({ ok: true, mensaje: 'Cita eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar cita:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar la cita.' });
    }
}

module.exports = {
    listarCitas,
    obtenerCita,
    registrarCita,
    editarCita,
    cambiarEstadoCita,
    eliminarCita
};
