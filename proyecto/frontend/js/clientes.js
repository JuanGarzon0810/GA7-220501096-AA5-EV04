/**
 * clientes.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Gestion de Clientes.
 * Consume la API REST expuesta por el backend (Express) y actualiza
 * el DOM en base al patron descrito en los diagramas de secuencia
 * y de actividades del proyecto (Ingresar datos -> Validar -> Guardar
 * -> Mostrar confirmacion).
 * ------------------------------------------------------------------
 */

// URL base de la API. Al servir el frontend desde el mismo backend
// (express.static) se puede usar una ruta relativa.
const API_CLIENTES = '/api/clientes';

// Referencias a elementos del DOM
const cuerpoTabla = document.getElementById('cuerpoTablaClientes');
const inputBuscar = document.getElementById('inputBuscar');
const overlayModal = document.getElementById('overlayModal');
const formCliente = document.getElementById('formCliente');
const tituloModal = document.getElementById('tituloModal');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');

const btnNuevoCliente = document.getElementById('btnNuevoCliente');
const btnCancelar = document.getElementById('btnCancelar');

// Se ejecuta al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Gestión de Clientes', 'Administra la base de clientes de la barbería');
    cargarClientes();
});

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------

btnNuevoCliente.addEventListener('click', () => abrirModal());
btnCancelar.addEventListener('click', () => cerrarModal());

// Busqueda en tiempo real con un pequeno "debounce" para no saturar la API
let temporizadorBusqueda = null;
inputBuscar.addEventListener('input', () => {
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(() => {
        cargarClientes(inputBuscar.value.trim());
    }, 300);
});

formCliente.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await guardarCliente();
});

// ------------------------------------------------------------
// Funciones principales
// ------------------------------------------------------------

/**
 * Consulta la API y pinta la tabla de clientes.
 * @param {string} busqueda - texto de busqueda opcional (RF06)
 */
async function cargarClientes(busqueda = '') {
    try {
        const url = busqueda
            ? `${API_CLIENTES}?buscar=${encodeURIComponent(busqueda)}`
            : API_CLIENTES;

        const respuesta = await fetchAutenticado(url);
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.mensaje);
        }

        pintarTabla(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudieron cargar los clientes.', true);
        console.error(error);
    }
}

/**
 * Renderiza las filas de la tabla de clientes.
 * @param {Array} clientes
 */
function pintarTabla(clientes) {
    if (!clientes || clientes.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr><td colspan="5" class="sin-datos">No hay clientes registrados</td></tr>
        `;
        return;
    }

    cuerpoTabla.innerHTML = clientes.map((cliente, indice) => `
        <tr>
            <td data-etiqueta="#">${indice + 1}</td>
            <td data-etiqueta="Nombre">${escaparHtml(cliente.nombre)}</td>
            <td data-etiqueta="Telefono">${escaparHtml(cliente.telefono)}</td>
            <td data-etiqueta="Correo">${escaparHtml(cliente.correo || '-')}</td>
            <td data-etiqueta="Acciones">
                <div class="acciones-fila">
                    <button class="btn btn-secundario" onclick="editarCliente(${cliente.id})">Editar</button>
                    <button class="btn btn-peligro" onclick="confirmarEliminacion(${cliente.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Abre el modal en modo "crear" o "editar".
 * @param {Object|null} cliente - si se envia, precarga el formulario
 */
function abrirModal(cliente = null) {
    formCliente.reset();
    mensajeErrorForm.textContent = '';

    if (cliente) {
        tituloModal.textContent = 'Editar Cliente';
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('inputNombre').value = cliente.nombre;
        document.getElementById('inputTelefono').value = cliente.telefono;
        document.getElementById('inputCorreo').value = cliente.correo || '';
    } else {
        tituloModal.textContent = 'Nuevo Cliente';
        document.getElementById('clienteId').value = '';
    }

    overlayModal.classList.add('activo');
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

/**
 * Obtiene el cliente por id y abre el modal de edicion (RF04).
 * @param {number} id
 */
async function editarCliente(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_CLIENTES}/${id}`);
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.mensaje);
        }

        abrirModal(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar la informacion del cliente.', true);
    }
}

/**
 * Envia el formulario (crear o editar segun exista clienteId).
 */
async function guardarCliente() {
    const id = document.getElementById('clienteId').value;
    const datosCliente = {
        nombre: document.getElementById('inputNombre').value.trim(),
        telefono: document.getElementById('inputTelefono').value.trim(),
        correo: document.getElementById('inputCorreo').value.trim()
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_CLIENTES}/${id}` : API_CLIENTES;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCliente)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarClientes(inputBuscar.value.trim());
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrio un error al guardar el cliente.';
        console.error(error);
    }
}

/**
 * Pide confirmacion antes de eliminar un cliente (RF05).
 * @param {number} id
 */
function confirmarEliminacion(id) {
    const confirmado = window.confirm('¿Deseas eliminar este cliente? Esta accion no se puede deshacer.');
    if (confirmado) {
        eliminarCliente(id);
    }
}

/**
 * Elimina un cliente y refresca la tabla.
 * @param {number} id
 */
async function eliminarCliente(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_CLIENTES}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.mensaje);
        }

        mostrarNotificacion(resultado.mensaje);
        cargarClientes(inputBuscar.value.trim());
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar el cliente.', true);
    }
}

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

/**
 * Muestra una notificacion flotante temporal.
 * @param {string} mensaje
 * @param {boolean} esError
 */
function mostrarNotificacion(mensaje, esError = false) {
    notificacion.textContent = mensaje;
    notificacion.classList.toggle('error', esError);
    notificacion.classList.add('activo');

    setTimeout(() => {
        notificacion.classList.remove('activo');
    }, 2500);
}

/**
 * Escapa texto para evitar inyeccion de HTML al pintar datos
 * provenientes de la base de datos (buena practica de seguridad, RNF04).
 * @param {string} texto
 * @returns {string}
 */
function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
