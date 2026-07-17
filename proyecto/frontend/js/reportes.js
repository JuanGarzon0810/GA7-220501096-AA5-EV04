/**
 * reportes.js
 * ------------------------------------------------------------------
 * Logica del frontend para el modulo de Reportes.
 *   RF22 - Generar reportes (ingresos por mes)
 *   RF23 - Mostrar servicios mas vendidos
 * ------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Reportes & Análisis', 'Estadísticas y métricas del negocio');
    cargarIngresosPorMes();
    cargarCitasPorEstado();
    cargarServiciosMasVendidos();
});

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(valor || 0);
}

/** Pinta una grafica de barras simple con divs (sin librerias externas). */
function pintarGraficaBarras(contenedorId, datos, obtenerEtiqueta, obtenerValor, formateador = (v) => v) {
    const contenedor = document.getElementById(contenedorId);

    if (!datos || datos.length === 0) {
        contenedor.innerHTML = '<p class="sin-datos">Aún no hay datos suficientes</p>';
        return;
    }

    const valorMaximo = Math.max(...datos.map(obtenerValor), 1);

    contenedor.innerHTML = datos.map((item) => {
        const valor = obtenerValor(item);
        const porcentaje = Math.round((valor / valorMaximo) * 100);
        return `
            <div class="fila-barra">
                <span class="etiqueta-barra">${obtenerEtiqueta(item)}</span>
                <div class="fondo-barra">
                    <div class="relleno-barra" style="width:${porcentaje}%"></div>
                </div>
                <span class="valor-barra">${formateador(valor)}</span>
            </div>
        `;
    }).join('');
}

/** RF22 - Ingresos agrupados por mes. */
async function cargarIngresosPorMes() {
    try {
        const respuesta = await fetchAutenticado('/api/reportes/ingresos-por-mes');
        const resultado = await respuesta.json();

        if (!resultado.ok) return;

        pintarGraficaBarras(
            'graficaIngresosPorMes',
            resultado.data,
            (item) => item.mes,
            (item) => Number(item.totalIngresos),
            formatearMoneda
        );
    } catch (error) {
        console.error('Error al cargar ingresos por mes:', error);
    }
}

/** Distribucion de citas por estado. */
async function cargarCitasPorEstado() {
    try {
        const respuesta = await fetchAutenticado('/api/reportes/citas-por-estado');
        const resultado = await respuesta.json();

        if (!resultado.ok) return;

        pintarGraficaBarras(
            'graficaCitasPorEstado',
            resultado.data,
            (item) => item.estado.replace('_', ' '),
            (item) => item.total
        );
    } catch (error) {
        console.error('Error al cargar citas por estado:', error);
    }
}

/** RF23 - Tabla de servicios mas vendidos con sus ingresos generados. */
async function cargarServiciosMasVendidos() {
    const contenedor = document.getElementById('tablaServiciosVendidos');

    try {
        const respuesta = await fetchAutenticado('/api/reportes/servicios-mas-vendidos');
        const resultado = await respuesta.json();

        if (!resultado.ok || resultado.data.length === 0) {
            contenedor.innerHTML = '<p class="sin-datos">Aún no hay servicios vendidos</p>';
            return;
        }

        contenedor.innerHTML = `
            <table class="tabla-clientes">
                <thead>
                    <tr>
                        <th>Servicio</th>
                        <th>Citas registradas</th>
                        <th>Ingresos generados</th>
                    </tr>
                </thead>
                <tbody>
                    ${resultado.data.map((servicio) => `
                        <tr>
                            <td data-etiqueta="Servicio">${escaparHtml(servicio.nombre)}</td>
                            <td data-etiqueta="Citas">${servicio.totalCitas}</td>
                            <td data-etiqueta="Ingresos">${formatearMoneda(servicio.totalIngresos)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        contenedor.innerHTML = '<p class="sin-datos">No se pudo cargar el reporte</p>';
        console.error(error);
    }
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
