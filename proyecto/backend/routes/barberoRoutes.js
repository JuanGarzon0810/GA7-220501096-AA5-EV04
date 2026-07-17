/**
 * barberoRoutes.js
 * ------------------------------------------------------------------
 *   GET    /api/barberos           -> listar barberos
 *   GET    /api/barberos/:id       -> obtener un barbero
 *   GET    /api/barberos/:id/citas -> citas asignadas (RF17)
 *   POST   /api/barberos           -> registrar barbero (RF16)
 *   PUT    /api/barberos/:id       -> editar barbero
 *   DELETE /api/barberos/:id       -> eliminar barbero
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const barberoController = require('../controllers/barberoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', barberoController.listarBarberos);
router.get('/:id', barberoController.obtenerBarbero);
router.get('/:id/citas', barberoController.listarCitasDelBarbero);
router.post('/', barberoController.registrarBarbero);
router.put('/:id', barberoController.editarBarbero);
router.delete('/:id', barberoController.eliminarBarbero);

module.exports = router;
