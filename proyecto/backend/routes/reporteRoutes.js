/**
 * reporteRoutes.js
 * ------------------------------------------------------------------
 *   GET /api/reportes/resumen-dashboard        -> tarjetas del dashboard
 *   GET /api/reportes/servicios-mas-vendidos   -> RF23
 *   GET /api/reportes/ingresos-por-mes         -> RF22
 *   GET /api/reportes/citas-por-estado         -> grafica de estados
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/resumen-dashboard', reporteController.resumenDashboard);
router.get('/servicios-mas-vendidos', reporteController.serviciosMasVendidos);
router.get('/ingresos-por-mes', reporteController.ingresosPorMes);
router.get('/citas-por-estado', reporteController.citasPorEstado);

module.exports = router;
