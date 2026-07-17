/**
 * servicioRoutes.js
 * ------------------------------------------------------------------
 *   GET    /api/servicios       -> listar servicios
 *   GET    /api/servicios/:id   -> obtener un servicio
 *   POST   /api/servicios       -> registrar servicio
 *   PUT    /api/servicios/:id   -> editar servicio
 *   DELETE /api/servicios/:id   -> eliminar servicio
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', servicioController.listarServicios);
router.get('/:id', servicioController.obtenerServicio);
router.post('/', servicioController.registrarServicio);
router.put('/:id', servicioController.editarServicio);
router.delete('/:id', servicioController.eliminarServicio);

module.exports = router;
