/**
 * pagos.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Pagos.
 *   RF20 - Registrar pagos
 *   RF21 - Mostrar ingresos diarios (se muestra el total general
 *          y desglosado por metodo de pago en las tarjetas resumen)
 * ------------------------------------------------------------------
 */

const API_PAGOS = '/api/pagos';
const API_CITAS = '/api/citas';

const cuerpoTabla = document.getElementById('cuerpoTablaPagos');
const overlayModal = document.getElementById('overlayModal');
const formPago = document.getElementById('formPago');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Gestión de Pagos', 'Registro e historial de transacciones');
    document.getElementById('inputFecha').valueAsDate = new Date();
    cargarPagos();
});

document.getElementById('btnRegistrarPago').addEventListener('click', () => abrirModal());
document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal());

formPago.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await registrarPago();
});

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(valor || 0);
}

/** Carga el historial de pagos y calcula los totales por metodo. */
async function cargarPagos() {
    try {
        const respuesta = await fetchAutenticado(API_PAGOS);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        pintarTarjetasResumen(resultado.data);
        pintarTabla(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar los pagos.', true);
        console.error(error);
    }
}

/** Calcula y pinta las tarjetas de totales por metodo de pago. */
function pintarTarjetasResumen(pagos) {
    const totales = { efectivo: 0, transferencia: 0, tarjeta: 0 };
    let totalGeneral = 0;

    pagos.forEach((pago) => {
        const monto = Number(pago.total);
        totalGeneral += monto;
        if (totales[pago.metodo_pago] !== undefined) {
            totales[pago.metodo_pago] += monto;
        }
    });

    document.getElementById('valorTotalGeneral').textContent = formatearMoneda(totalGeneral);
    document.getElementById('valorEfectivo').textContent = formatearMoneda(totales.efectivo);
    document.getElementById('valorTransferencia').textContent = formatearMoneda(totales.transferencia);
    document.getElementById('valorTarjeta').textContent = formatearMoneda(totales.tarjeta);
}

function pintarTabla(pagos) {
    if (!pagos || pagos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay pagos registrados</td></tr>';
        return;
    }

    cuerpoTabla.innerHTML = pagos.map((pago) => `
        <tr>
            <td data-etiqueta="Cliente">${escaparHtml(pago.cliente)}</td>
            <td data-etiqueta="Servicio">${escaparHtml(pago.servicio)}</td>
            <td data-etiqueta="Monto">${formatearMoneda(pago.total)}</td>
            <td data-etiqueta="Método">${capitalizar(pago.metodo_pago)}</td>
            <td data-etiqueta="Fecha">${pago.fecha.slice(0, 10)}</td>
            <td data-etiqueta="Acciones">
                <button class="btn btn-peligro" onclick="confirmarEliminacion(${pago.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

/** Carga en el select las citas disponibles para asociar el pago. */
async function cargarCitasDisponibles() {
    try {
        const respuesta = await fetchAutenticado(API_CITAS);
        const resultado = await respuesta.json();

        const select = document.getElementById('selectCita');

        if (!resultado.ok || resultado.data.length === 0) {
            select.innerHTML = '<option value="">No hay citas disponibles</option>';
            return;
        }

        // Se priorizan las citas que aun no estan finalizadas ni canceladas
        const citasOrdenadas = [...resultado.data].sort((a, b) => {
            const prioridad = { pendiente: 0, en_proceso: 1, finalizada: 2, cancelada: 3 };
            return prioridad[a.estado] - prioridad[b.estado];
        });

        select.innerHTML = citasOrdenadas.map((cita) => `
            <option value="${cita.id}" data-precio="${cita.precio}">
                ${escaparHtml(cita.cliente)} — ${escaparHtml(cita.servicio)} (${cita.fecha.slice(0, 10)} ${cita.hora.slice(0, 5)}) [${cita.estado}]
            </option>
        `).join('');

        // Autocompleta el monto con el precio del servicio de la primera cita
        actualizarMontoSugerido();
    } catch (error) {
        console.error('Error al cargar las citas disponibles:', error);
    }
}

/** Sugiere el monto a pagar segun el precio del servicio de la cita seleccionada. */
function actualizarMontoSugerido() {
    const select = document.getElementById('selectCita');
    const opcionSeleccionada = select.options[select.selectedIndex];

    if (opcionSeleccionada && opcionSeleccionada.dataset.precio) {
        document.getElementById('inputTotal').value = Math.round(Number(opcionSeleccionada.dataset.precio));
    }
}

function abrirModal() {
    formPago.reset();
    mensajeErrorForm.textContent = '';
    document.getElementById('inputFecha').valueAsDate = new Date();
    cargarCitasDisponibles();
    overlayModal.classList.add('activo');

    document.getElementById('selectCita').addEventListener('change', actualizarMontoSugerido);
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

/** RF20 - Registra un nuevo pago asociado a una cita. */
async function registrarPago() {
    const datosPago = {
        citaId: Number(document.getElementById('selectCita').value),
        total: Number(document.getElementById('inputTotal').value),
        metodoPago: document.getElementById('selectMetodo').value,
        fecha: document.getElementById('inputFecha').value
    };

    try {
        const respuesta = await fetchAutenticado(API_PAGOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPago)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarPagos();
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrió un error al registrar el pago.';
    }
}

function confirmarEliminacion(id) {
    const confirmado = window.confirm('¿Deseas eliminar este registro de pago?');
    if (confirmado) {
        eliminarPago(id);
    }
}

async function eliminarPago(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_PAGOS}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarNotificacion(resultado.mensaje, true);
            return;
        }

        mostrarNotificacion(resultado.mensaje);
        cargarPagos();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar el pago.', true);
    }
}

function mostrarNotificacion(mensaje, esError = false) {
    notificacion.textContent = mensaje;
    notificacion.classList.toggle('error', esError);
    notificacion.classList.add('activo');
    setTimeout(() => notificacion.classList.remove('activo'), 2500);
}

function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
