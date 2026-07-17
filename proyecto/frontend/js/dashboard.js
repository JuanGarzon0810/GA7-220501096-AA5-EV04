/**
 * dashboard.js
 * ------------------------------------------------------------------
 * Logica de la pantalla principal (Dashboard).
 * Consume el modulo de Reportes (RF22, RF23) y el modulo de Citas
 * (RF15: citas diarias) para alimentar las tarjetas de indicadores
 * y las graficas del panel principal.
 * ------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarLayout('Dashboard', 'Resumen general de la barbería');
    cargarResumen();
    cargarProximasCitas();
    cargarCitasPorEstado();
    cargarServiciosPopulares();
});

/** Formatea un numero como moneda en pesos colombianos. */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor || 0);
}

/** Carga las tarjetas de indicadores generales. */
async function cargarResumen() {
    try {
        const respuesta = await fetchAutenticado('/api/reportes/resumen-dashboard');
        const resultado = await respuesta.json();

        if (!resultado.ok) return;

        document.getElementById('valorTotalClientes').textContent = resultado.data.totalClientes;
        document.getElementById('valorTotalCitas').textContent = resultado.data.totalCitas;
        document.getElementById('valorTotalIngresos').textContent = formatearMoneda(resultado.data.totalIngresos);
        document.getElementById('valorCitasHoy').textContent = resultado.data.citasHoy;
    } catch (error) {
        console.error('Error al cargar el resumen del dashboard:', error);
    }
}

/** Carga las citas del dia de hoy como "proximas citas" (RF15). */
async function cargarProximasCitas() {
    const contenedor = document.getElementById('listaProximasCitas');

    try {
        const hoy = new Date().toISOString().slice(0, 10);
        const respuesta = await fetchAutenticado(`/api/citas?fecha=${hoy}`);
        const resultado = await respuesta.json();

        if (!resultado.ok || resultado.data.length === 0) {
            contenedor.innerHTML = '<p class="sin-datos">No hay citas pendientes para hoy</p>';
            return;
        }

        contenedor.innerHTML = resultado.data.map((cita) => `
            <div class="fila-barra">
                <span class="etiqueta-barra">${cita.hora.slice(0, 5)} — ${cita.cliente}</span>
                <span class="valor-barra">${cita.servicio}</span>
                <span class="insignia insignia-${cita.estado}">${cita.estado.replace('_', ' ')}</span>
            </div>
        `).join('');
    } catch (error) {
        contenedor.innerHTML = '<p class="sin-datos">No se pudieron cargar las citas</p>';
        console.error(error);
    }
}

/** Pinta una grafica de barras simple con divs (sin librerias externas). */
function pintarGraficaBarras(contenedorId, datos, obtenerEtiqueta, obtenerValor) {
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
                <span class="valor-barra">${valor}</span>
            </div>
        `;
    }).join('');
}

/** Carga la distribucion de citas por estado. */
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

/** Carga el reporte de servicios mas vendidos (RF23). */
async function cargarServiciosPopulares() {
    try {
        const respuesta = await fetchAutenticado('/api/reportes/servicios-mas-vendidos');
        const resultado = await respuesta.json();

        if (!resultado.ok) return;

        // Solo se muestran los servicios que ya tienen al menos una cita
        const conCitas = resultado.data.filter((s) => s.totalCitas > 0);

        pintarGraficaBarras(
            'graficaServiciosPopulares',
            conCitas,
            (item) => item.nombre,
            (item) => item.totalCitas
        );
    } catch (error) {
        console.error('Error al cargar servicios populares:', error);
    }
}
