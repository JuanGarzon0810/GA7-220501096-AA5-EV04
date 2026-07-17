/**
 * pagoRoutes.js
 * ------------------------------------------------------------------
 *   GET    /api/pagos/ingresos/hoy -> ingresos del dia (RF21)
 *   GET    /api/pagos              -> listar pagos
 *   GET    /api/pagos/:id          -> obtener un pago
 *   POST   /api/pagos              -> registrar pago (RF20)
 *   DELETE /api/pagos/:id          -> eliminar pago
 *
 * IMPORTANTE: la ruta "/ingresos/hoy" se declara ANTES que "/:id"
 * para que Express no interprete "ingresos" como un id de pago.
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/ingresos/hoy', pagoController.obtenerIngresosDelDia);
router.get('/', pagoController.listarPagos);
router.get('/:id', pagoController.obtenerPago);
router.post('/', pagoController.registrarPago);
router.delete('/:id', pagoController.eliminarPago);

module.exports = router;
