/**
 * authRoutes.js
 * ------------------------------------------------------------------
 * Endpoints REST del modulo de Autenticacion.
 *
 *   POST /api/auth/login   -> iniciar sesion (RF01)
 *   GET  /api/auth/perfil  -> obtener datos del usuario autenticado
 *   POST /api/auth/logout  -> cerrar sesion (RF02)
 * ------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/login', authController.iniciarSesion);
router.get('/perfil', verificarToken, authController.obtenerPerfil);
router.post('/logout', verificarToken, authController.cerrarSesion);

module.exports = router;
