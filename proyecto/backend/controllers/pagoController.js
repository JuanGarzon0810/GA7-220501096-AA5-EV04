/**
 * pagoController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Pagos.
 *   RF20 - Registrar pagos
 *   RF21 - Mostrar ingresos diarios
 *
 * Sigue el Diagrama de Actividades 3 (Registrar pago): ingresar datos
 * -> validar informacion -> guardar o mostrar error.
 * ------------------------------------------------------------------
 */

const pagoModel = require('../models/pagoModel');
const citaModel = require('../models/citaModel');

const METODOS_VALIDOS = ['efectivo', 'transferencia', 'tarjeta'];

function validarPago({ citaId, total, metodoPago, fecha }) {
    if (!citaId) {
        return 'Debes seleccionar la cita asociada al pago.';
    }
    if (total === undefined || total === null || isNaN(total) || Number(total) <= 0) {
        return 'El total del pago debe ser un numero mayor a cero.';
    }
    if (!METODOS_VALIDOS.includes(metodoPago)) {
        return `El metodo de pago debe ser uno de: ${METODOS_VALIDOS.join(', ')}.`;
    }
    if (!fecha || isNaN(Date.parse(fecha))) {
        return 'La fecha del pago no es valida.';
    }
    return null;
}

/** GET /api/pagos */
async function listarPagos(req, res) {
    try {
        const pagos = await pagoModel.obtenerPagos();
        return res.status(200).json({ ok: true, data: pagos });
    } catch (error) {
        console.error('Error al listar pagos:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los pagos.' });
    }
}

/** GET /api/pagos/:id */
async function obtenerPago(req, res) {
    try {
        const pago = await pagoModel.obtenerPagoPorId(req.params.id);
        if (!pago) {
            return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado.' });
        }
        return res.status(200).json({ ok: true, data: pago });
    } catch (error) {
        console.error('Error al obtener pago:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el pago.' });
    }
}

/** POST /api/pagos -> RF20 */
async function registrarPago(req, res) {
    try {
        const { citaId, total, metodoPago, fecha } = req.body;
        const errorValidacion = validarPago({ citaId, total, metodoPago, fecha });

        if (errorValidacion) {
            return res.status(400).json({ ok: false, mensaje: errorValidacion });
        }

        // Se verifica que la cita exista antes de registrar el pago (integridad referencial)
        const cita = await citaModel.obtenerCitaPorId(citaId);
        if (!cita) {
            return res.status(404).json({ ok: false, mensaje: 'La cita indicada no existe.' });
        }

        const nuevoId = await pagoModel.crearPago({ citaId, total, metodoPago, fecha });
        const pagoCreado = await pagoModel.obtenerPagoPorId(nuevoId);

        // Una vez pagada, la cita se marca como finalizada
        await citaModel.actualizarEstadoCita(citaId, 'finalizada');

        return res.status(201).json({
            ok: true,
            mensaje: 'Pago registrado correctamente.',
            data: pagoCreado
        });
    } catch (error) {
        console.error('Error al registrar pago:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el pago.' });
    }
}

/** DELETE /api/pagos/:id */
async function eliminarPago(req, res) {
    try {
        const eliminado = await pagoModel.eliminarPago(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado.' });
        }
        return res.status(200).json({ ok: true, mensaje: 'Pago eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar pago:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el pago.' });
    }
}

/**
 * GET /api/pagos/ingresos/hoy
 * RF21 - Mostrar ingresos diarios (por defecto, del dia actual;
 * admite ?fecha=YYYY-MM-DD para consultar otro dia).
 */
async function obtenerIngresosDelDia(req, res) {
    try {
        const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
        const ingresos = await pagoModel.obtenerIngresosDelDia(fecha);
        return res.status(200).json({ ok: true, data: { fecha, ...ingresos } });
    } catch (error) {
        console.error('Error al obtener ingresos del dia:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al calcular los ingresos del dia.' });
    }
}

module.exports = {
    listarPagos,
    obtenerPago,
    registrarPago,
    eliminarPago,
    obtenerIngresosDelDia
};
