/**
 * authController.js
 * ------------------------------------------------------------------
 * Controlador del modulo de Autenticacion.
 *   RF01 - El sistema debe permitir iniciar sesion.
 *   RF02 - El sistema debe permitir cerrar sesion.
 *   RNF04 - Debe proteger contrasenas (bcrypt).
 *
 * Sigue el flujo del Diagrama de Secuencia 1 y el Diagrama de
 * Actividades 1 (Iniciar sesion): ingresar credenciales -> validar
 * credenciales -> conceder o negar el acceso.
 * ------------------------------------------------------------------
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const JWT_SECRET = process.env.JWT_SECRET || 'barbiere11_clave_secreta';
const JWT_EXPIRACION = '8h'; // duracion de la sesion

/**
 * POST /api/auth/login
 * Valida las credenciales del usuario y devuelve un token JWT.
 */
async function iniciarSesion(req, res) {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ ok: false, mensaje: 'Correo y contraseña son obligatorios.' });
        }

        const usuario = await usuarioModel.obtenerUsuarioPorCorreo(correo);

        // Se responde el mismo mensaje generico si el usuario no existe
        // o si la contrasena es incorrecta, para no revelar informacion
        // sensible a un posible atacante.
        if (!usuario) {
            return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
        }

        // Se genera el token de sesion (no se incluye la contrasena)
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRACION }
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Acceso concedido.',
            data: {
                token,
                usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesion:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al iniciar sesion.' });
    }
}

/**
 * GET /api/auth/perfil
 * Devuelve la informacion del usuario autenticado a partir del
 * token enviado (util para que el frontend valide la sesion activa).
 */
async function obtenerPerfil(req, res) {
    try {
        // req.usuario es inyectado por el middleware de autenticacion
        const usuario = await usuarioModel.obtenerUsuarioPorId(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
        }

        return res.status(200).json({ ok: true, data: usuario });
    } catch (error) {
        console.error('Error al obtener perfil:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el perfil.' });
    }
}

/**
 * POST /api/auth/logout
 * RF02 - Cerrar sesion.
 * Como se usa JWT sin estado, "cerrar sesion" se resuelve en el
 * frontend eliminando el token almacenado. Este endpoint existe
 * para mantener explicito el requisito funcional y poder registrar
 * la accion o invalidar el token en una lista negra en el futuro.
 */
function cerrarSesion(req, res) {
    return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada correctamente.' });
}

module.exports = {
    iniciarSesion,
    obtenerPerfil,
    cerrarSesion
};
