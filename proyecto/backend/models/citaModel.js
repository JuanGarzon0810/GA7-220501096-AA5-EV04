/**
 * citaModel.js
 * ------------------------------------------------------------------
 * Modelo de datos de la entidad "Cita" (Diagrama de Clases 5:
 * Cita | id:int, fecha:date, hora:String, estado:String), relacionada
 * con Cliente, Servicio y Barbero (Diagrama de Clases General).
 * ------------------------------------------------------------------
 */

const pool = require('../config/db');

// Seleccion reutilizable con JOIN para mostrar datos legibles en vez de solo ids
const SELECT_BASE = `
    SELECT c.id, c.fecha, c.hora, c.estado,
           c.cliente_id, cl.nombre AS cliente,
           c.servicio_id, s.nombre AS servicio, s.precio, s.duracion,
           c.barbero_id, b.nombre AS barbero
    FROM citas c
    INNER JOIN clientes cl ON cl.id = c.cliente_id
    INNER JOIN servicios s ON s.id = c.servicio_id
    INNER JOIN barberos b ON b.id = c.barbero_id
`;

/**
 * Obtiene todas las citas. Si se recibe una fecha, filtra solo las
 * citas de ese dia (RF15: mostrar citas diarias).
 * @param {string} fecha - formato YYYY-MM-DD (opcional)
 */
async function obtenerCitas(fecha = '') {
    if (fecha) {
        const [filas] = await pool.query(
            `${SELECT_BASE} WHERE c.fecha = ? ORDER BY c.hora ASC`,
            [fecha]
        );
        return filas;
    }

    const [filas] = await pool.query(`${SELECT_BASE} ORDER BY c.fecha DESC, c.hora ASC`);
    return filas;
}

/** Obtiene una cita por id. */
async function obtenerCitaPorId(id) {
    const [filas] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [id]);
    return filas.length > 0 ? filas[0] : null;
}

/**
 * Verifica si el barbero ya tiene una cita activa en la misma
 * fecha y hora (Historia de Usuario 4: "El sistema debe evitar
 * registrar citas duplicadas en el mismo horario").
 * @param {Object} datos - { barberoId, fecha, hora, idExcluir }
 * @returns {Promise<boolean>} true si el horario esta ocupado
 */
async function existeCruceDeHorario({ barberoId, fecha, hora, idExcluir = null }) {
    let consulta = `
        SELECT id FROM citas
        WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
    `;
    const parametros = [barberoId, fecha, hora];

    if (idExcluir) {
        consulta += ' AND id != ?';
        parametros.push(idExcluir);
    }

    const [filas] = await pool.query(consulta, parametros);
    return filas.length > 0;
}

/** Registra una nueva cita (RF11, RF12). */
async function crearCita({ clienteId, servicioId, barberoId, fecha, hora }) {
    const [resultado] = await pool.query(
        `INSERT INTO citas (cliente_id, servicio_id, barbero_id, fecha, hora, estado)
         VALUES (?, ?, ?, ?, ?, 'pendiente')`,
        [clienteId, servicioId, barberoId, fecha, hora]
    );
    return resultado.insertId;
}

/** Edita una cita existente (RF13). */
async function actualizarCita(id, { clienteId, servicioId, barberoId, fecha, hora }) {
    const [resultado] = await pool.query(
        `UPDATE citas
         SET cliente_id = ?, servicio_id = ?, barbero_id = ?, fecha = ?, hora = ?
         WHERE id = ?`,
        [clienteId, servicioId, barberoId, fecha, hora, id]
    );
    return resultado.affectedRows > 0;
}

/**
 * Cambia el estado de una cita (RF14: cancelar citas, y tambien se
 * reutiliza para el caso de uso "Cambiar estado de atencion" del barbero).
 * @param {number} id
 * @param {string} estado - pendiente | en_proceso | finalizada | cancelada
 */
async function actualizarEstadoCita(id, estado) {
    const [resultado] = await pool.query(
        `UPDATE citas SET estado = ? WHERE id = ?`,
        [estado, id]
    );
    return resultado.affectedRows > 0;
}

/** Elimina una cita definitivamente. */
async function eliminarCita(id) {
    const [resultado] = await pool.query(`DELETE FROM citas WHERE id = ?`, [id]);
    return resultado.affectedRows > 0;
}

module.exports = {
    obtenerCitas,
    obtenerCitaPorId,
    existeCruceDeHorario,
    crearCita,
    actualizarCita,
    actualizarEstadoCita,
    eliminarCita
};
