/**
 * citas.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Gestion de Citas.
 *   RF11 - Registrar citas
 *   RF12 - Asociar servicios a las citas
 *   RF13 - Editar citas
 *   RF14 - Cancelar citas
 *   RF15 - Mostrar citas diarias (filtro por estado se usa como
 *          complemento visual sobre el listado completo)
 * ------------------------------------------------------------------
 */

const API_CITAS = '/api/citas';
const API_CLIENTES = '/api/clientes';
const API_SERVICIOS = '/api/servicios';
const API_BARBEROS = '/api/barberos';

const cuerpoTabla = document.getElementById('cuerpoTablaCitas');
const overlayModal = document.getElementById('overlayModal');
const formCita = document.getElementById('formCita');
const tituloModal = document.getElementById('tituloModal');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');
const pestanasEstado = document.getElementById('pestanasEstado');

let citasCargadas = [];
let estadoFiltroActual = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Gestión de Citas', 'Agenda y administra las citas');
    cargarCitas();
    cargarOpcionesFormulario();
});

document.getElementById('btnNuevaCita').addEventListener('click', () => abrirModal());
document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal());

formCita.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await guardarCita();
});

pestanasEstado.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.pestana');
    if (!boton) return;

    document.querySelectorAll('.pestana').forEach((p) => p.classList.remove('activa'));
    boton.classList.add('activa');
    estadoFiltroActual = boton.dataset.estado;
    pintarTabla();
});

/** Carga todas las citas desde la API. */
async function cargarCitas() {
    try {
        const respuesta = await fetchAutenticado(API_CITAS);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        citasCargadas = resultado.data;
        pintarTabla();
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar las citas.', true);
        console.error(error);
    }
}

/** Pinta la tabla aplicando el filtro de estado seleccionado en las pestanas. */
function pintarTabla() {
    const citasFiltradas = estadoFiltroActual === 'todas'
        ? citasCargadas
        : citasCargadas.filter((c) => c.estado === estadoFiltroActual);

    if (citasFiltradas.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay citas registradas</td></tr>';
        return;
    }

    cuerpoTabla.innerHTML = citasFiltradas.map((cita) => `
        <tr>
            <td data-etiqueta="Cliente">${escaparHtml(cita.cliente)}</td>
            <td data-etiqueta="Servicio">${escaparHtml(cita.servicio)}</td>
            <td data-etiqueta="Fecha">${cita.fecha.slice(0, 10)}</td>
            <td data-etiqueta="Hora">${cita.hora.slice(0, 5)}</td>
            <td data-etiqueta="Barbero">${escaparHtml(cita.barbero)}</td>
            <td data-etiqueta="Estado">
                <span class="insignia insignia-${cita.estado}">${cita.estado.replace('_', ' ')}</span>
            </td>
            <td data-etiqueta="Acciones">
                <div class="acciones-fila">
                    <button class="btn btn-secundario" onclick="editarCita(${cita.id})">Editar</button>
                    ${cita.estado !== 'cancelada' && cita.estado !== 'finalizada' ? `
                        <button class="btn btn-peligro" onclick="cancelarCita(${cita.id})">Cancelar</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/** Carga los combos de cliente, servicio y barbero para el formulario. */
async function cargarOpcionesFormulario() {
    try {
        const [respClientes, respServicios, respBarberos] = await Promise.all([
            fetchAutenticado(API_CLIENTES),
            fetchAutenticado(API_SERVICIOS),
            fetchAutenticado(API_BARBEROS)
        ]);

        const [clientes, servicios, barberos] = await Promise.all([
            respClientes.json(), respServicios.json(), respBarberos.json()
        ]);

        llenarSelect('selectCliente', clientes.data, (c) => c.nombre);
        llenarSelect('selectServicio', servicios.data, (s) => `${s.nombre} (${s.duracion} min)`);
        llenarSelect('selectBarbero', barberos.data, (b) => b.nombre);
    } catch (error) {
        console.error('Error al cargar las opciones del formulario:', error);
    }
}

/** Llena un <select> con las opciones recibidas. */
function llenarSelect(idSelect, items, obtenerTexto) {
    const select = document.getElementById(idSelect);
    select.innerHTML = '<option value="">Selecciona una opción</option>' +
        (items || []).map((item) => `<option value="${item.id}">${escaparHtml(obtenerTexto(item))}</option>`).join('');
}

function abrirModal(cita = null) {
    formCita.reset();
    mensajeErrorForm.textContent = '';

    if (cita) {
        tituloModal.textContent = 'Editar Cita';
        document.getElementById('citaId').value = cita.id;
        document.getElementById('selectCliente').value = cita.cliente_id;
        document.getElementById('selectServicio').value = cita.servicio_id;
        document.getElementById('selectBarbero').value = cita.barbero_id;
        document.getElementById('inputFecha').value = cita.fecha.slice(0, 10);
        document.getElementById('inputHora').value = cita.hora.slice(0, 5);
    } else {
        tituloModal.textContent = 'Nueva Cita';
        document.getElementById('citaId').value = '';
    }

    overlayModal.classList.add('activo');
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

/** RF13 - Carga la cita y abre el modal de edicion. */
async function editarCita(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_CITAS}/${id}`);
        const resultado = await respuesta.json();
        if (!resultado.ok) throw new Error(resultado.mensaje);
        abrirModal(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar la cita.', true);
    }
}

/** RF11, RF12, RF13 - Registra o edita una cita. */
async function guardarCita() {
    const id = document.getElementById('citaId').value;
    const datosCita = {
        clienteId: Number(document.getElementById('selectCliente').value),
        servicioId: Number(document.getElementById('selectServicio').value),
        barberoId: Number(document.getElementById('selectBarbero').value),
        fecha: document.getElementById('inputFecha').value,
        hora: document.getElementById('inputHora').value
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_CITAS}/${id}` : API_CITAS;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCita)
        });

        const resultado = await respuesta.json();

        // Aqui se refleja la validacion de disponibilidad de horario
        // (Historia de Usuario 4 / Diagrama de Actividades 2)
        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarCitas();
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrió un error al guardar la cita.';
    }
}

/** RF14 - Cancela una cita (cambia su estado a "cancelada"). */
function cancelarCita(id) {
    const confirmado = window.confirm('¿Deseas cancelar esta cita?');
    if (confirmado) {
        cambiarEstadoCita(id, 'cancelada');
    }
}

async function cambiarEstadoCita(id, estado) {
    try {
        const respuesta = await fetchAutenticado(`${API_CITAS}/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarNotificacion(resultado.mensaje, true);
            return;
        }

        mostrarNotificacion(resultado.mensaje);
        cargarCitas();
    } catch (error) {
        mostrarNotificacion('No se pudo actualizar el estado de la cita.', true);
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
