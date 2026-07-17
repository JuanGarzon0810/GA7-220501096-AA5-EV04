/**
 * inventario.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Inventario.
 *   RF18 - Registrar productos
 *   RF19 - Actualizar stock
 * ------------------------------------------------------------------
 */

const API_PRODUCTOS = '/api/productos';

const cuerpoTabla = document.getElementById('cuerpoTablaProductos');
const overlayModal = document.getElementById('overlayModal');
const formProducto = document.getElementById('formProducto');
const tituloModal = document.getElementById('tituloModal');
const mensajeErrorForm = document.getElementById('mensajeErrorForm');
const notificacion = document.getElementById('notificacion');

const overlayStock = document.getElementById('overlayStock');
const formStock = document.getElementById('formStock');
const mensajeErrorStock = document.getElementById('mensajeErrorStock');

const STOCK_MINIMO = 5; // umbral usado para marcar "stock bajo" visualmente

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Control de Inventario', 'Gestiona tus productos y stock');
    cargarProductos();
});

document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirModal());
document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal());
document.getElementById('btnCancelarStock').addEventListener('click', () => overlayStock.classList.remove('activo'));

formProducto.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await guardarProducto();
});

formStock.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    await actualizarStock();
});

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(valor || 0);
}

async function cargarProductos() {
    try {
        const respuesta = await fetchAutenticado(API_PRODUCTOS);
        const resultado = await respuesta.json();

        if (!resultado.ok) throw new Error(resultado.mensaje);

        pintarTabla(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar el inventario.', true);
        console.error(error);
    }
}

function pintarTabla(productos) {
    if (!productos || productos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay productos en inventario</td></tr>';
        return;
    }

    cuerpoTabla.innerHTML = productos.map((producto, indice) => {
        const stockBajo = producto.stock <= STOCK_MINIMO;
        return `
            <tr>
                <td data-etiqueta="#">${indice + 1}</td>
                <td data-etiqueta="Producto">${escaparHtml(producto.nombre)}</td>
                <td data-etiqueta="Cantidad">${producto.stock}</td>
                <td data-etiqueta="Precio">${formatearMoneda(producto.precio)}</td>
                <td data-etiqueta="Estado">
                    <span class="insignia ${stockBajo ? 'insignia-cancelada' : 'insignia-finalizada'}">
                        ${stockBajo ? 'Stock bajo' : 'Disponible'}
                    </span>
                </td>
                <td data-etiqueta="Acciones">
                    <div class="acciones-fila">
                        <button class="btn btn-secundario" onclick="abrirModalStock(${producto.id}, '${escaparHtml(producto.nombre)}')">Stock</button>
                        <button class="btn btn-secundario" onclick="editarProducto(${producto.id})">Editar</button>
                        <button class="btn btn-peligro" onclick="confirmarEliminacion(${producto.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModal(producto = null) {
    formProducto.reset();
    mensajeErrorForm.textContent = '';

    if (producto) {
        tituloModal.textContent = 'Editar Producto';
        document.getElementById('productoId').value = producto.id;
        document.getElementById('inputNombre').value = producto.nombre;
        document.getElementById('inputStock').value = producto.stock;
        document.getElementById('inputPrecio').value = producto.precio;
    } else {
        tituloModal.textContent = 'Nuevo Producto';
        document.getElementById('productoId').value = '';
    }

    overlayModal.classList.add('activo');
}

function cerrarModal() {
    overlayModal.classList.remove('activo');
}

async function editarProducto(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_PRODUCTOS}/${id}`);
        const resultado = await respuesta.json();
        if (!resultado.ok) throw new Error(resultado.mensaje);
        abrirModal(resultado.data);
    } catch (error) {
        mostrarNotificacion('No se pudo cargar el producto.', true);
    }
}

async function guardarProducto() {
    const id = document.getElementById('productoId').value;
    const datosProducto = {
        nombre: document.getElementById('inputNombre').value.trim(),
        stock: Number(document.getElementById('inputStock').value),
        precio: Number(document.getElementById('inputPrecio').value)
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_PRODUCTOS}/${id}` : API_PRODUCTOS;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorForm.textContent = resultado.mensaje;
            return;
        }

        cerrarModal();
        mostrarNotificacion(resultado.mensaje);
        cargarProductos();
    } catch (error) {
        mensajeErrorForm.textContent = 'Ocurrió un error al guardar el producto.';
    }
}

/** RF19 - Abre el modal dedicado a ajustar unicamente el stock. */
function abrirModalStock(id, nombre) {
    formStock.reset();
    mensajeErrorStock.textContent = '';
    document.getElementById('productoStockId').value = id;
    document.getElementById('nombreProductoStock').textContent = nombre;
    overlayStock.classList.add('activo');
}

async function actualizarStock() {
    const id = document.getElementById('productoStockId').value;
    const cantidad = Number(document.getElementById('inputCantidadStock').value);

    try {
        const respuesta = await fetchAutenticado(`${API_PRODUCTOS}/${id}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad })
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mensajeErrorStock.textContent = resultado.mensaje;
            return;
        }

        overlayStock.classList.remove('activo');
        mostrarNotificacion(resultado.mensaje);
        cargarProductos();
    } catch (error) {
        mensajeErrorStock.textContent = 'Ocurrió un error al actualizar el stock.';
    }
}

function confirmarEliminacion(id) {
    const confirmado = window.confirm('¿Deseas eliminar este producto del inventario?');
    if (confirmado) {
        eliminarProducto(id);
    }
}

async function eliminarProducto(id) {
    try {
        const respuesta = await fetchAutenticado(`${API_PRODUCTOS}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarNotificacion(resultado.mensaje, true);
            return;
        }

        mostrarNotificacion(resultado.mensaje);
        cargarProductos();
    } catch (error) {
        mostrarNotificacion('No se pudo eliminar el producto.', true);
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
