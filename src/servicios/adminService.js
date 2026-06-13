/**
 * SERVICIO DE ADMINISTRADORES
 * Archivo: src/servicios/adminService.js
 * 
 * Maneja el registro de administradores del sistema.
 * Solo quien tenga la contraseña maestra puede crear admins.
 */

import { dbPromise } from '../base_datos/database.js';

const CONTRASENA_MAESTRA = 'ues2024admin';

function hashContrasena(contrasena) {
    let hash = 0;
    for (let i = 0; i < contrasena.length; i++) {
        const char = contrasena.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
}

function verificarContraseniaMaestra(contrasena) {
    return contrasena === CONTRASENA_MAESTRA;
}

async function verificarCorreoDuplicadoAdmin(correo) {
    const db = await dbPromise;
    const usuario = await db.getFromIndex('usuarios', 'correo', correo.toLowerCase());
    return usuario ? true : false;
}

async function verificarDUIDuplicadoAdmin(dui) {
    const db = await dbPromise;
    const usuario = await db.getFromIndex('usuarios', 'dui', dui);
    return usuario ? true : false;
}

export async function registrarAdmin(datos) {
    try {
        if (!verificarContraseniaMaestra(datos.contraseniaMaestra)) {
            return {
                exito: false,
                mensaje: 'Contraseña maestra incorrecta'
            };
        }

        if (!datos.nombre || !datos.correo || !datos.dui || !datos.telefono || !datos.contrasena) {
            return {
                exito: false,
                mensaje: 'Todos los campos son requeridos'
            };
        }

        const correoDuplicado = await verificarCorreoDuplicadoAdmin(datos.correo.toLowerCase());
        if (correoDuplicado) {
            return {
                exito: false,
                mensaje: 'Este correo ya está registrado'
            };
        }

        const duiDuplicado = await verificarDUIDuplicadoAdmin(datos.dui);
        if (duiDuplicado) {
            return {
                exito: false,
                mensaje: 'Este DUI ya está registrado'
            };
        }

        const db = await dbPromise;
        const nuevoAdmin = {
            nombre: datos.nombre.trim(),
            correo: datos.correo.toLowerCase(),
            telefono: datos.telefono.trim(),
            dui: datos.dui.trim(),
            contrasena: hashContrasena(datos.contrasena),
            tipo: 'admin',
            validado: true,
            estado: 'aprobado',
            fechaRegistro: new Date().toISOString(),
            codigoInstitucional: `ADM${Date.now().toString().slice(-6)}`
        };

        const id = await db.add('usuarios', nuevoAdmin);

        return {
            exito: true,
            mensaje: 'Administrador creado exitosamente',
            admin: { id, ...nuevoAdmin }
        };
    } catch (error) {
        console.error('Error registrando admin:', error);
        return {
            exito: false,
            mensaje: 'Error en el servidor. Intenta de nuevo'
        };
    }
}

export default {
    registrarAdmin,
    verificarContraseniaMaestra
};