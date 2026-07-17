/**
 * reporteController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Reportes.
 *   RF22 - Generar reportes
 *   RF23 - Mostrar servicios mas vendidos
 *
 * Este modulo no tiene su propia tabla: consulta y agrega
 * informacion de citas, pagos y servicios para alimentar el
 * Dashboard y la pantalla de Reportes descritos en los wireframes.
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

/**
 * GET /api/reportes/servicios-mas-vendidos
 * RF23 - Cuenta cuantas veces se ha agendado cada servicio.
 */
async function serviciosMasVendidos(req, res) {
    try {
        const [filas] = await pool.query(`
            SELECT s.nombre, COUNT(c.id) AS totalCitas,
                   COALESCE(SUM(p.total), 0) AS totalIngresos
            FROM servicios s
            LEFT JOIN citas c ON c.servicio_id = s.id
            LEFT JOIN pagos p ON p.cita_id = c.id
            GROUP BY s.id, s.nombre
            ORDER BY totalCitas DESC
        `);
        return res.status(200).json({ ok: true, data: filas });
    } catch (error) {
        console.error('Error al generar reporte de servicios mas vendidos:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al generar el reporte.' });
    }
}

/**
 * GET /api/reportes/ingresos-por-mes
 * RF22 - Ingresos agrupados por mes (para la grafica del Dashboard/Reportes).
 */
async function ingresosPorMes(req, res) {
    try {
        const [filas] = await pool.query(`
            SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, SUM(total) AS totalIngresos
            FROM pagos
            GROUP BY mes
            ORDER BY mes ASC
        `);
        return res.status(200).json({ ok: true, data: filas });
    } catch (error) {
        console.error('Error al generar reporte de ingresos por mes:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al generar el reporte.' });
    }
}

/**
 * GET /api/reportes/citas-por-estado
 * Distribucion de citas segun su estado (pendiente, en_proceso,
 * finalizada, cancelada), usado en la grafica de "Citas por Estado".
 */
async function citasPorEstado(req, res) {
    try {
        const [filas] = await pool.query(`
            SELECT estado, COUNT(*) AS total
            FROM citas
            GROUP BY estado
        `);
        return res.status(200).json({ ok: true, data: filas });
    } catch (error) {
        console.error('Error al generar reporte de citas por estado:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al generar el reporte.' });
    }
}

/**
 * GET /api/reportes/resumen-dashboard
 * Trae en una sola peticion los indicadores que se muestran en las
 * tarjetas del Dashboard: total de clientes, total de citas,
 * ingresos acumulados y citas programadas para hoy.
 */
async function resumenDashboard(req, res) {
    try {
        const hoy = new Date().toISOString().slice(0, 10);

        const [[totalClientes]] = await pool.query('SELECT COUNT(*) AS total FROM clientes');
        const [[totalCitas]] = await pool.query('SELECT COUNT(*) AS total FROM citas');
        const [[totalIngresos]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM pagos');
        const [[citasHoy]] = await pool.query('SELECT COUNT(*) AS total FROM citas WHERE fecha = ?', [hoy]);

        return res.status(200).json({
            ok: true,
            data: {
                totalClientes: totalClientes.total,
                totalCitas: totalCitas.total,
                totalIngresos: totalIngresos.total,
                citasHoy: citasHoy.total
            }
        });
    } catch (error) {
        console.error('Error al generar resumen del dashboard:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al generar el resumen.' });
    }
}

module.exports = {
    serviciosMasVendidos,
    ingresosPorMes,
    citasPorEstado,
    resumenDashboard
};
