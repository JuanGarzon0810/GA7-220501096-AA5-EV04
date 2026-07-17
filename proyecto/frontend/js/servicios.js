/**
 * servicios.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Gestion de Servicios.
 *   RF07 - Registrar servicios
 *   RF08 - Editar servicios
 *   RF09 - Eliminar servicios
 *   RF10 - Mostrar precio y duracion de los servicios
 * ------------------------------------------------------------------
 */

const API_SERVICIOS = '/api/servicios';

const grillaServicios = document.getElementById('grillaServicios');
const overlayModal = document.getElementById('overlayModal');
const formServicio = document.getElementById('formServicio');
const tituloModal = document.getElementById('tituloModal');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Gestión de Servicios', 'Configura los servicios de la barbería');
    cargarServicios();
});

document.getElementById('btnNuevoServicio').addEventListener('click', () => abrirModal());
document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal());

formServicio.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await guardarServicio();
});

/** Formatea un numero como moneda en pesos colombianos. */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor || 0);
}

/** Consulta la API y pinta las tarjetas de servicios (RF10). */
async function cargarServicios() {
    try {
        const respuesta = await fetchAutenticado(API_SERVICIOS);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        pintarGrilla(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar los servicios.', true);
        console.error(error);
    }
}

/** Renderiza las tarjetas de servicios. */
function pintarGrilla(servicios) {
    if (!servicios || servicios.length === 0) {
        grillaServicios.innerHTML = '<p class="sin-datos">No hay servicios registrados</p>';
        return;
    }

    grillaServicios.innerHTML = servicios.map((servicio) => `
        <div class="tarjeta-servicio">
            <h4>${escaparHtml(servicio.nombre)}</h4>
            <p class="precio-servicio">${formatearMoneda(servicio.precio)}</p>
            <p class="detalle-servicio">⏱ ${servicio.duracion} minutos</p>
            <div class="acciones-fila">
                <button class="btn btn-secundario" onclick="editarServicio(${servicio.id})">Editar</button>
                <button class="btn btn-peligro" onclick="confirmarEliminacion(${servicio.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function abrirModal(servicio = null) {
    formServicio.reset();
    mensajeErrorForm.textContent = '';

    if (servicio) {
        tituloModal.textContent = 'Editar Servicio';
        document.getElementById('servicioId').value = servicio.id;
        document.getElementById('inputNombre').value = servicio.nombre;
        document.getElementById('inputPrecio').value = servicio.precio;
        document.getElementById('inputDuracion').value = servicio.duracion;
        document.getElementById('inputDescripcion').value = servicio.descripcion || '';
    } else {
        tituloModal.textContent = 'Nuevo Servicio';
        document.getElementById('servicioId').value = '';
    }

    overlayModal.classList.add('activo');
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

/** RF08 - Obtiene el servicio y abre el modal de edicion. */
async function editarServicio(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_SERVICIOS}/${id}`);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        abrirModal(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar el servicio.', true);
    }
}

/** Registra o edita un servicio segun corresponda. */
async function guardarServicio() {
    const id = document.getElementById('servicioId').value;
    const datosServicio = {
        nombre: document.getElementById('inputNombre').value.trim(),
        precio: Number(document.getElementById('inputPrecio').value),
        duracion: Number(document.getElementById('inputDuracion').value),
        descripcion: document.getElementById('inputDescripcion').value.trim()
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_SERVICIOS}/${id}` : API_SERVICIOS;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosServicio)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarServicios();
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrió un error al guardar el servicio.';
        console.error(error);
    }
}

/** RF09 - Pide confirmacion y elimina un servicio. */
function confirmarEliminacion(id) {
    const confirmado = window.confirm('¿Deseas eliminar este servicio?');
    if (confirmado) {
        eliminarServicio(id);
    }
}

async function eliminarServicio(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_SERVICIOS}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarNotificacion(resultado.mensaje, true);
            return;
        }

        mostrarNotificacion(resultado.mensaje);
        cargarServicios();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar el servicio.', true);
    }
}

function mostrarNotificacion(mensaje, esError = false) {
    notificacion.textContent = mensaje;
    notificacion.classList.toggle('error', esError);
    notificacion.classList.add('activo');
    setTimeout(() => notificacion.classList.remove('activo'), 2500);
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
