/**
 * citaRoutes.js
 * ------------------------------------------------------------------
 *   GET    /api/citas             -> listar citas (admite ?fecha=)
 *   GET    /api/citas/:id         -> obtener una cita
 *   POST   /api/citas             -> registrar cita (RF11, RF12)
 *   PUT    /api/citas/:id         -> editar cita (RF13)
 *   PATCH  /api/citas/:id/estado  -> cambiar estado / cancelar (RF14)
 *   DELETE /api/citas/:id         -> eliminar cita
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', citaController.listarCitas);
router.get('/:id', citaController.obtenerCita);
router.post('/', citaController.registrarCita);
router.put('/:id', citaController.editarCita);
router.patch('/:id/estado', citaController.cambiarEstadoCita);
router.delete('/:id', citaController.eliminarCita);

module.exports = router;
