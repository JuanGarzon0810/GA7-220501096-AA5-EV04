/**
 * barberos.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Gestion de Barberos.
 *   RF16 - Registrar barberos
 *   RF17 - Mostrar citas asignadas a cada barbero
 * ------------------------------------------------------------------
 */

const API_BARBEROS = '/api/barberos';

const cuerpoTabla = document.getElementById('cuerpoTablaBarberos');
const overlayModal = document.getElementById('overlayModal');
const formBarbero = document.getElementById('formBarbero');
const tituloModal = document.getElementById('tituloModal');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');
const overlayCitasBarbero = document.getElementById('overlayCitasBarbero');

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Gestión de Barberos', 'Administra el personal de la barbería');
    cargarBarberos();
});

document.getElementById('btnNuevoBarbero').addEventListener('click', () => abrirModal());
document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal());
document.getElementById('btnCerrarCitasBarbero').addEventListener('click', () => {
    overlayCitasBarbero.classList.remove('activo');
});

formBarbero.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await guardarBarbero();
});

/** Carga la lista de barberos junto con la cantidad de citas asignadas. */
async function cargarBarberos() {
    try {
        const respuesta = await fetchAutenticado(API_BARBEROS);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        await pintarTabla(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar los barberos.', true);
        console.error(error);
    }
}

/**
 * Renderiza la tabla de barberos. Para cada barbero se consulta
 * cuantas citas tiene asignadas (RF17), mostrando el conteo en la tabla.
 */
async function pintarTabla(barberos) {
    if (!barberos || barberos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay barberos registrados</td></tr>';
        return;
    }

    // Se consultan las citas de todos los barberos en paralelo
    const conteos = await Promise.all(
        barberos.map((b) => fetchAutenticado(`${API_BARBEROS}/${b.id}/citas`).then((r) => r.json()))
    );

    cuerpoTabla.innerHTML = barberos.map((barbero, indice) => {
        const totalCitas = conteos[indice].ok ? conteos[indice].data.length : 0;
        return `
            <tr>
                <td data-etiqueta="#">${indice + 1}</td>
                <td data-etiqueta="Nombre">${escaparHtml(barbero.nombre)}</td>
                <td data-etiqueta="Especialidad">${escaparHtml(barbero.especialidad || '-')}</td>
                <td data-etiqueta="Teléfono">${escaparHtml(barbero.telefono || '-')}</td>
                <td data-etiqueta="Citas">
                    <button class="btn btn-secundario" onclick="verCitasBarbero(${barbero.id}, '${escaparHtml(barbero.nombre)}')">
                        ${totalCitas} cita(s)
                    </button>
                </td>
                <td data-etiqueta="Acciones">
                    <div class="acciones-fila">
                        <button class="btn btn-secundario" onclick="editarBarbero(${barbero.id})">Editar</button>
                        <button class="btn btn-peligro" onclick="confirmarEliminacion(${barbero.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/** RF17 - Muestra el detalle de las citas asignadas a un barbero. */
async function verCitasBarbero(id, nombre) {
    const contenedor = document.getElementById('listaCitasBarbero');
    contenedor.innerHTML = '<p class="sin-datos">Cargando citas...</p>';
    overlayCitasBarbero.classList.add('activo');

    try {
        const respuesta = await fetchAutenticado(`${API_BARBEROS}/${id}/citas`);
        const resultado = await respuesta.json();

        if (!resultado.ok || resultado.data.length === 0) {
            contenedor.innerHTML = `<p class="sin-datos">${nombre} no tiene citas asignadas</p>`;
            return;
        }

        contenedor.innerHTML = resultado.data.map((cita) => `
            <div class="fila-barra">
                <span class="etiqueta-barra">${cita.fecha.slice(0, 10)} ${cita.hora.slice(0, 5)}</span>
                <span class="valor-barra">${escaparHtml(cita.cliente)} — ${escaparHtml(cita.servicio)}</span>
                <span class="insignia insignia-${cita.estado}">${cita.estado.replace('_', ' ')}</span>
            </div>
        `).join('');
    } catch (error) {
        contenedor.innerHTML = '<p class="sin-datos">No se pudieron cargar las citas</p>';
    }
}

function abrirModal(barbero = null) {
    formBarbero.reset();
    mensajeErrorForm.textContent = '';

    if (barbero) {
        tituloModal.textContent = 'Editar Barbero';
        document.getElementById('barberoId').value = barbero.id;
        document.getElementById('inputNombre').value = barbero.nombre;
        document.getElementById('inputEspecialidad').value = barbero.especialidad || '';
        document.getElementById('inputTelefono').value = barbero.telefono || '';
    } else {
        tituloModal.textContent = 'Nuevo Barbero';
        document.getElementById('barberoId').value = '';
    }

    overlayModal.classList.add('activo');
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

async function editarBarbero(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_BARBEROS}/${id}`);
        const resultado = await respuesta.json();
        if (!resultado.ok) throw new Error(resultado.mensaje);
        abrirModal(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar el barbero.', true);
    }
}

async function guardarBarbero() {
    const id = document.getElementById('barberoId').value;
    const datosBarbero = {
        nombre: document.getElementById('inputNombre').value.trim(),
        especialidad: document.getElementById('inputEspecialidad').value.trim(),
        telefono: document.getElementById('inputTelefono').value.trim()
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_BARBEROS}/${id}` : API_BARBEROS;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosBarbero)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarBarberos();
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrió un error al guardar el barbero.';
    }
}

function confirmarEliminacion(id) {
    const confirmado = window.confirm('¿Deseas eliminar este barbero?');
    if (confirmado) {
        eliminarBarbero(id);
    }
}

async function eliminarBarbero(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_BARBEROS}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarNotificacion(resultado.mensaje, true);
            return;
        }

        mostrarNotificacion(resultado.mensaje);
        cargarBarberos();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar el barbero.', true);
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
