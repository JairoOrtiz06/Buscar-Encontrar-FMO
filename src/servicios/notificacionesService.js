import { dbPromise } from '../base_datos/database.js';

/**
 * @typedef {Object} DatosNotificacion
 * @property {string | number | null | undefined} [idUsuario]
 * @property {string} titulo
 * @property {string} mensaje
 * @property {string} [tipo]
 * @property {Record<string, any> | null} [referencia]
 */

/**
 * @param {string | number | null | undefined} idUsuario
 * @returns {string | number | null}
 */
function normalizarId(idUsuario) {
    if (idUsuario == null || idUsuario === '') return null;
    const numero = Number(idUsuario);
    return Number.isNaN(numero) ? idUsuario : numero;
}

/**
 * @param {DatosNotificacion} datos
 */
export async function enviarNotificacion({ idUsuario, titulo, mensaje, tipo = 'info', referencia = null }) {
    const destinatario = normalizarId(idUsuario);
    if (destinatario == null || !titulo || !mensaje) return null;

    const db = await dbPromise;
    return await db.add('notificaciones', {
        idUsuario: destinatario,
        titulo,
        mensaje,
        tipo,
        referencia,
        leida: false,
        fechaCreacion: new Date().toISOString()
    });
}

/**
 * @param {Omit<DatosNotificacion, 'idUsuario'>} datos
 */
export async function enviarNotificacionAdmins({ titulo, mensaje, tipo = 'admin', referencia = null }) {
    const db = await dbPromise;
    const usuarios = await db.getAll('usuarios');
    const admins = usuarios.filter(usuario => usuario.tipo === 'admin');

    await Promise.all(
        admins.map(admin =>
            enviarNotificacion({
                idUsuario: admin.id,
                titulo,
                mensaje,
                tipo,
                referencia
            })
        )
    );
}

export async function obtenerNotificaciones(idUsuario) {
    const destinatario = normalizarId(idUsuario);
    if (destinatario == null) return [];

    const db = await dbPromise;
    const todas = await db.getAllFromIndex('notificaciones', 'idUsuario', destinatario);

    return todas.sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
}

export async function contarNoLeidas(idUsuario) {
    const notificaciones = await obtenerNotificaciones(idUsuario);
    return notificaciones.filter(notificacion => !notificacion.leida).length;
}

export async function marcarNotificacionLeida(idNotificacion) {
    const db = await dbPromise;
    const notificacion = await db.get('notificaciones', idNotificacion);
    if (!notificacion) return;

    notificacion.leida = true;
    notificacion.fechaLectura = new Date().toISOString();
    await db.put('notificaciones', notificacion);
}

export async function marcarTodasLeidas(idUsuario) {
    const db = await dbPromise;
    const notificaciones = await obtenerNotificaciones(idUsuario);

    await Promise.all(
        notificaciones
            .filter(notificacion => !notificacion.leida)
            .map(notificacion =>
                db.put('notificaciones', {
                    ...notificacion,
                    leida: true,
                    fechaLectura: new Date().toISOString()
                })
            )
    );
}
