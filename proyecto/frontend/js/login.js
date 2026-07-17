/**
 * login.js
 * ------------------------------------------------------------------
 * Logica de la pantalla de inicio de sesion (RF01).
 * Sigue el Diagrama de Actividades 1: ingresar credenciales ->
 * validar credenciales -> mostrar error o conceder acceso.
 * ------------------------------------------------------------------
 */

const formLogin = document.getElementById('formLogin');
const mensajeErrorLogin = document.getElementById('mensajeErrorLogin');
const btnIngresar = document.getElementById('btnIngresar');

// Si ya existe una sesion activa, se redirige directo al dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (obtenerToken()) {
        window.location.href = 'dashboard.html';
    }
});

formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensajeErrorLogin.textContent = '';

    const correo = document.getElementById('inputCorreo').value.trim();
    const password = document.getElementById('inputPassword').value;

    btnIngresar.disabled = true;
    btnIngresar.textContent = 'Ingresando...';

    try {
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorLogin.textContent = resultado.mensaje;
            return;
        }

        guardarSesion(resultado.data.token, resultado.data.usuario);
        window.location.href = 'dashboard.html';
    } catch (error) {
        mensajeErrorLogin.textContent = 'No se pudo conectar con el servidor.';
        console.error(error);
    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = 'Ingresar al Sistema →';
    }
});
