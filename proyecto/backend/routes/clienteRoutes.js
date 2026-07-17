/**
 * clienteRoutes.js
 * ------------------------------------------------------------------
 * Define los endpoints REST del modulo de Clientes y los enlaza
 * con las funciones del controlador correspondiente.
 *
 *   GET    /api/clientes         -> listar / buscar clientes
 *   GET    /api/clientes/:id     -> obtener un cliente
 *   POST   /api/clientes         -> registrar cliente
 *   PUT    /api/clientes/:id     -> editar cliente
 *   DELETE /api/clientes/:id     -> eliminar cliente
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const verificarToken = require('../middlewares/authMiddleware');

// Todas las rutas de este modulo requieren una sesion activa
router.use(verificarToken);

router.get('/', clienteController.listarClientes);
router.get('/:id', clienteController.obtenerCliente);
router.post('/', clienteController.registrarCliente);
router.put('/:id', clienteController.editarCliente);
router.delete('/:id', clienteController.eliminarCliente);

module.exports = router;
