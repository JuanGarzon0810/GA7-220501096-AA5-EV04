/**
 * productoRoutes.js
 * ------------------------------------------------------------------
 *   GET    /api/productos            -> listar inventario
 *   GET    /api/productos/:id        -> obtener un producto
 *   POST   /api/productos            -> registrar producto (RF18)
 *   PUT    /api/productos/:id        -> editar producto
 *   PATCH  /api/productos/:id/stock  -> actualizar stock (RF19)
 *   DELETE /api/productos/:id        -> eliminar producto
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', productoController.listarProductos);
router.get('/:id', productoController.obtenerProducto);
router.post('/', productoController.registrarProducto);
router.put('/:id', productoController.editarProducto);
router.patch('/:id/stock', productoController.actualizarStockProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;
