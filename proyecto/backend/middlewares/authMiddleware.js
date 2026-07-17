/**
 * authMiddleware.js
 * ------------------------------------------------------------------
 * Middleware de Express encargado de proteger las rutas privadas
 * de la API (RNF04 - Debe proteger contrasenas / RNF03 y seguridad
 * general del sistema).
 *
 * Verifica que la peticion incluya un token JWT valido en el header
 * "Authorization: Bearer <token>". Si es valido, agrega la
 * informacion del usuario a "req.usuario" para que los controladores
 * puedan usarla; si no, corta la peticion con 401.
 * ------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'barbiere11_clave_secreta';

function verificarToken(req, res, next) {
    const encabezadoAuth = req.headers['authorization'];

    if (!encabezadoAuth || !encabezadoAuth.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, mensaje: 'No se proporciono un token de acceso.' });
    }

    const token = encabezadoAuth.split(' ')[1];

    try {
        const datosToken = jwt.verify(token, JWT_SECRET);
        req.usuario = datosToken; // { id, nombre, rol }
        next();
    } catch (error) {
        return res.status(401).json({ ok: false, mensaje: 'Token invalido o expirado. Inicia sesion nuevamente.' });
    }
}

module.exports = verificarToken;
