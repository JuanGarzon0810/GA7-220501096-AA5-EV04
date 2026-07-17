/**
 * auth.js
 * ------------------------------------------------------------------
 * Modulo transversal de autenticacion para el frontend.
 * Se incluye en TODAS las paginas protegidas (Dashboard, Clientes,
 * Servicios, Barberos, Citas, Inventario, Pagos, Reportes) y en la
 * pagina de login.
 *
 * Responsabilidades:
 *   - Guardar/leer el token JWT y los datos del usuario en sessionStorage.
 *   - Redirigir a login.html si no hay una sesion activa (RF01).
 *   - Cerrar sesion (RF02).
 *   - Exponer "fetchAutenticado", un envoltorio de fetch que agrega
 *     automaticamente el header Authorization en cada peticion.
 *
 * Nota: se usa sessionStorage en lugar de localStorage para que la
 * sesion se cierre automaticamente al cerrar la pestana del navegador,
 * reforzando la seguridad (RNF04).
 * ------------------------------------------------------------------
 */

const CLAVE_TOKEN = 'barbiere11_token';
const CLAVE_USUARIO = 'barbiere11_usuario';

/** Guarda la sesion del usuario tras un login exitoso. */
function guardarSesion(token, usuario) {
    sessionStorage.setItem(CLAVE_TOKEN, token);
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

/** Obtiene el token JWT almacenado, o null si no existe. */
function obtenerToken() {
    return sessionStorage.getItem(CLAVE_TOKEN);
}

/** Obtiene los datos basicos del usuario autenticado. */
function obtenerUsuarioActual() {
    const datos = sessionStorage.getItem(CLAVE_USUARIO);
    return datos ? JSON.parse(datos) : null;
}

/**
 * RF02 - Cierra la sesion del usuario: limpia el almacenamiento local
 * y redirige a la pantalla de login.
 */
function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
    window.location.href = 'login.html';
}

/**
 * Protege una pagina: si no hay token guardado, redirige al login.
 * Debe llamarse al inicio de cada pagina privada del sistema.
 */
function protegerPagina() {
    if (!obtenerToken()) {
        window.location.href = 'login.html';
    }
}

/**
 * Envoltorio de "fetch" que agrega automaticamente el header
 * Authorization con el token JWT, y cierra la sesion si el backend
 * responde 401 (token invalido o expirado).
 * @param {string} url
 * @param {Object} opciones - mismas opciones que acepta fetch()
 * @returns {Promise<Response>}
 */
async function fetchAutenticado(url, opciones = {}) {
    const token = obtenerToken();

    const encabezados = {
        ...(opciones.headers || {}),
        'Authorization': `Bearer ${token}`
    };

    const respuesta = await fetch(url, { ...opciones, headers: encabezados });

    if (respuesta.status === 401) {
        cerrarSesion();
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    return respuesta;
}
