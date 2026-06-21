/**
 * SERVICIO DE AUTENTICACIÓN
 * Archivo: src/servicios/authService.js
 * 
 * Funciones principales:
 * - login(): Autentica un usuario
 * - logout(): Cierra una sesión
 * - verificarSesion(): Valida si una sesión es activa
 * - obtenerUsuario(): Obtiene datos de un usuario
 */

import { dbPromise } from '../base_datos/database.js';

// Convertir contraseña a hash (simple, para proyecto educativo)
// En producción usarías bcrypt en el backend
function hashearContrasena(contrasena) {
    let hash = 0;
    for (let i = 0; i < contrasena.length; i++) {
        const char = contrasena.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
}

// Generar un token único para identificar una sesión activa
function generarToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}


// LOGIN - Autenticar usuario con correo y contraseña
// Devuelve: { exito, usuario, token, mensaje }
export async function login(correo, contrasena) {
    try {
        // Validar que los datos no estén vacíos
        if (!correo || !contrasena) {
            return {
                exito: false,
                mensaje: 'Correo y contraseña son requeridos'
            };
        }

        // Conectar a la base de datos
        const db = await dbPromise;
        let usuario;
        
        // Buscar el usuario por correo (usa el índice para búsqueda rápida)
        try {
            usuario = await db.getFromIndex('usuarios', 'correo', correo.toLowerCase());
        } catch (error) {
            console.error('Error buscando usuario:', error);
            usuario = null;
        }

        // Validar que el usuario existe en la BD
        if (!usuario) {
            return {
                exito: false,
                mensaje: 'Este correo no esta registrado en el sistema'
            };
        }

        // Validar que el usuario fue aprobado por administrador
        if (usuario.validado === false) {
            return {
                exito: false,
                mensaje: 'Tu cuenta esta pendiente de aprobacion del administrador'
            };
        }

        // Validar que la cuenta no fue rechazada
        if (usuario.estado === 'rechazado') {
            return {
                exito: false,
                mensaje: 'Tu cuenta ha sido rechazada. Contacta al administrador'
            };
        }
        if (usuario.estado === 'desactivado') {
            return {
                exito: false,
                mensaje: 'Tu cuenta ha sido desactivada. Contacta al administrador'
            };
        }


        // Verificar que la contraseña es correcta
        // Se comparan los hashes (no guardamos contraseñas en texto plano)
        const contraseniaHasheada = hashearContrasena(contrasena);
        if (usuario.contrasena !== contraseniaHasheada) {
            return {
                exito: false,
                mensaje: 'Correo o contraseña incorrectos'
            };
        }

        // Crear un token de sesión válido por 24 horas
        const token = generarToken();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

        // Guardar la sesión en la BD (para control de sesiones activas)
        try {
            await db.add('sesiones', {
                idUsuario: usuario.id,
                token: token,
                fechaCreacion: ahora.toISOString(),
                fechaExpiracion: expiracion.toISOString()
            });
        } catch (error) {
            console.warn('Sesion no guardada en BD:', error);
        }

        console.log('Login exitoso:', correo);

        // Login exitoso - devolver los datos del usuario
        return {
            exito: true,
            mensaje: 'Bienvenido',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipo: usuario.tipo,
                carnet: usuario.carnet || null
            },
            token: token
        };

    } catch (error) {
        console.error('Error en login:', error);
        return {
            exito: false,
            mensaje: 'Error en el servidor. Intenta de nuevo'
        };
    }
}

// LOGOUT - Cerrar una sesión activa
// Recibe el token de la sesión a cerrar
export async function logout(token) {
    try {
        const db = await dbPromise;
        
        // Buscar la sesión en la BD por su token
        const sesiones = await db.getAll('sesiones');
        const sesion = sesiones.find(s => s.token === token);
        
        // Si la sesión existe, eliminarla
        if (sesion) {
            await db.delete('sesiones', sesion.id);
            console.log('Sesion cerrada');
        }

        return { exito: true };

    } catch (error) {
        console.error('Error en logout:', error);
        return { exito: false };
    }
}

// VERIFICAR SESIÓN - Validar si una sesión es válida y no está expirada
// Se usa cuando la app se carga (onMount) para restaurar la sesión del usuario
// Retorna: { valida: boolean, usuario, token }
export async function verificarSesion(token) {
    try {
        // Si no hay token, sesión inválida
        if (!token) {
            return { valida: false };
        }

        const db = await dbPromise;
        
        // Buscar la sesión en la BD
        const sesiones = await db.getAll('sesiones');
        const sesion = sesiones.find(s => s.token === token);

        // Si no existe la sesión, es inválida
        if (!sesion) {
            return { valida: false };
        }

        // Verificar que la sesión no esté expirada
        const ahora = new Date();
        const expiracion = new Date(sesion.fechaExpiracion);

        if (ahora > expiracion) {
            // La sesión expiró - eliminarla de la BD
            await db.delete('sesiones', sesion.id);
            return { valida: false };
        }

        // Obtener los datos del usuario asociado al token
        const usuario = await db.get('usuarios', sesion.idUsuario);

        // Si el usuario no existe, sesión inválida
        if (!usuario) {
            return { valida: false };
        }

        // Sesión es válida - devolver datos del usuario y token
        return {
            valida: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipo: usuario.tipo,
                carnet: usuario.carnet || null
            },
            token: token
        };

    } catch (error) {
        console.error('Error verificando sesion:', error);
        return { valida: false };
    }
}

// OBTENER USUARIO - Buscar un usuario por su ID
// No devuelve la contraseña (por seguridad)
// Retorna: objeto del usuario o null si no existe
export async function obtenerUsuario(idUsuario) {
    try {
        const db = await dbPromise;
        const usuario = await db.get('usuarios', idUsuario);
        
        // Si no existe, devolver null
        if (!usuario) {
            return null;
        }

        // Separar la contraseña de los demás datos (no devolver contraseña)
        const { contrasena, ...usuarioSeguro } = usuario;
        return usuarioSeguro;

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

// EXPORTAR todas las funciones para usarlas en otros módulos
export default {
    login,
    logout,
    verificarSesion,
    obtenerUsuario
};

