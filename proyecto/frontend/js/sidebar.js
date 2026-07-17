/**
 * sidebar.js
 * ------------------------------------------------------------------
 * Inyecta el menu lateral (sidebar) y la barra superior (topbar) en
 * todas las paginas privadas del sistema, replicando el layout visto
 * en los wireframes (Dashboard, Clientes, Servicios, Citas, etc.).
 *
 * Cada pagina debe definir, ANTES de incluir este script, la variable
 * global PAGINA_ACTIVA con el identificador de la seccion actual
 * (ej: 'dashboard', 'clientes', 'servicios', 'barberos', 'citas',
 * 'inventario', 'pagos', 'reportes') para que el enlace correspondiente
 * quede resaltado en el menu.
 * ------------------------------------------------------------------
 */

const ENLACES_MENU = [
    { grupo: 'PRINCIPAL', items: [
        { id: 'dashboard', texto: 'Dashboard', href: 'dashboard.html', icono: '📊' }
    ]},
    { grupo: 'GESTIÓN', items: [
        { id: 'clientes', texto: 'Clientes', href: 'clientes.html', icono: '👥' },
        { id: 'citas', texto: 'Citas', href: 'citas.html', icono: '📅' },
        { id: 'servicios', texto: 'Servicios', href: 'servicios.html', icono: '✂️' },
        { id: 'barberos', texto: 'Barberos', href: 'barberos.html', icono: '💈' },
        { id: 'pagos', texto: 'Pagos', href: 'pagos.html', icono: '💳' },
        { id: 'inventario', texto: 'Inventario', href: 'inventario.html', icono: '📦' }
    ]},
    { grupo: 'ANÁLISIS', items: [
        { id: 'reportes', texto: 'Reportes', href: 'reportes.html', icono: '📈' }
    ]}
];

/** Construye el HTML del menu lateral marcando la seccion activa. */
function construirSidebar() {
    const usuario = obtenerUsuarioActual();
    const nombreUsuario = usuario ? usuario.nombre : 'Administrador';

    const grupos = ENLACES_MENU.map((grupo) => `
        <p class="titulo-grupo-menu">${grupo.grupo}</p>
        ${grupo.items.map((item) => `
            <a href="${item.href}" class="enlace-menu ${item.id === window.PAGINA_ACTIVA ? 'activo' : ''}">
                <span class="icono-menu">${item.icono}</span> ${item.texto}
            </a>
        `).join('')}
    `).join('');

    return `
        <div class="marca-sidebar">
            <h2>B<span class="acento-dorado">11</span></h2>
            <p>Sistema Premium</p>
        </div>

        <div class="estado-barberia">
            <span class="punto-verde"></span> Barbería Abierta
        </div>

        <nav class="menu-lateral">
            ${grupos}
        </nav>

        <div class="pie-sidebar">
            <div class="perfil-usuario">
                <div class="avatar-usuario">${nombreUsuario.charAt(0).toUpperCase()}</div>
                <div>
                    <p class="nombre-usuario">${nombreUsuario}</p>
                    <p class="rol-usuario">administrador</p>
                </div>
            </div>
            <button class="btn-salir" id="btnCerrarSesion">⎋ Salir</button>
        </div>
    `;
}

/** Construye el HTML de la barra superior con fecha y hora en vivo. */
function construirTopbar(tituloPagina, descripcionPagina) {
    return `
        <div>
            <h1>${tituloPagina}</h1>
            <p class="descripcion-topbar">${descripcionPagina}</p>
        </div>
        <div class="info-topbar">
            <span class="estado-abierta">● Abierta</span>
            <span id="relojTopbar"></span>
        </div>
    `;
}

/** Actualiza el reloj de la barra superior cada segundo. */
function iniciarReloj() {
    const elementoReloj = document.getElementById('relojTopbar');
    if (!elementoReloj) return;

    function actualizar() {
        const ahora = new Date();
        elementoReloj.textContent = ahora.toLocaleString('es-CO', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
    }

    actualizar();
    setInterval(actualizar, 1000 * 30);
}

/**
 * Punto de entrada: inserta el sidebar y el topbar en la pagina.
 * Debe llamarse despues de que el DOM este listo.
 * @param {string} tituloPagina
 * @param {string} descripcionPagina
 */
function inicializarLayout(tituloPagina, descripcionPagina) {
    protegerPagina();

    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');

    if (sidebar) sidebar.innerHTML = construirSidebar();
    if (topbar) topbar.innerHTML = construirTopbar(tituloPagina, descripcionPagina);

    const btnSalir = document.getElementById('btnCerrarSesion');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            const confirmado = window.confirm('¿Deseas cerrar sesión?');
            if (confirmado) {
                cerrarSesion();
            }
        });
    }

    iniciarReloj();
}
