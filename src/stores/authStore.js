

import { writable, derived } from 'svelte/store';
import { verificarSesion } from '../servicios/authService.js';

// ============================================================
// 1. STORES WRITABLE (Estado que se puede modificar)
// ============================================================

// Usuario actualmente logueado
// Estructura: { id, nombre, correo, tipo, carnet }
// null si no hay usuario logueado
/** @type {import('svelte/store').Writable<any>} */
export const usuarioActual = writable(null);

// Token de sesión actual
// Se usa para verificar que la sesión es válida
// null si no hay sesión activa
export const tokenSesion = writable(null);

// Mensaje de error actual
// Se muestra al usuario cuando algo falla
// null si no hay error
export const errorActual = writable(null);

// Indica si está cargando datos (ej: durante login)
// true mientras se procesa una acción, false cuando termina
export const estaCargando = writable(false);

// ============================================================
// 2. STORES DERIVED (Estado calculado automáticamente)
// ============================================================

// Booleano: si hay usuario logueado
// Se actualiza automáticamente cuando usuarioActual cambia
// Útil para mostrar/ocultar elementos en la UI
export const estaLogueado = derived(
    usuarioActual,
    $usuarioActual => $usuarioActual !== null
);

// Tipo de usuario actual (estudiante, docente, admin, etc)
// null si no hay usuario logueado
// Útil para controlar qué componentes mostrar según el tipo
export const tipoUsuario = derived(
    usuarioActual,
    $usuarioActual => $usuarioActual?.tipo || null
);

// ============================================================
// 3. FUNCIONES: ESTABLECER USUARIO (CREATE)
// ============================================================

// Cuando el login es exitoso, guardar usuario y token
// También guarda en localStorage para persistencia
export function establecerUsuarioAutenticado(usuario, token) {
    // Actualizar stores en memoria
    usuarioActual.set(usuario);
    tokenSesion.set(token);
    
    // Guardar en localStorage para persistencia entre recargas
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    localStorage.setItem('tokenSesion', token);
    
    // Limpiar cualquier error anterior
    limpiarError();
}

export function actualizarUsuarioActual(datosActualizados) {
    let usuarioActualizado = null;

    usuarioActual.update(usuario => {
        if (!usuario) return usuario;

        usuarioActualizado = {
            ...usuario,
            ...datosActualizados
        };

        return usuarioActualizado;
    });

    if (usuarioActualizado) {
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
    }
}

// ============================================================
// 4. FUNCIONES: CERRAR SESIÓN (DELETE)
// ============================================================

// Cuando el usuario hace logout, limpiar todo
export function logout() {
    // Limpiar stores en memoria
    usuarioActual.set(null);
    tokenSesion.set(null);
    
    // Limpiar localStorage
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('tokenSesion');
    
    // Limpiar errores
    limpiarError();
}

// ============================================================
// 5. FUNCIONES: MANEJO DE ERRORES
// ============================================================

// Mostrar un error al usuario
// Se muestra en la UI (ej: en un componente de alerta)
export function establecerError(mensaje) {
    errorActual.set(mensaje);
}

// Limpiar el error actual
export function limpiarError() {
    errorActual.set(null);
}

// ============================================================
// 6. FUNCIONES: MANEJO DE ESTADOS DE CARGA
// ============================================================

// Indicar que está cargando
// true = mostrar spinner, false = ocultar spinner
export function establecerCargando(valor) {
    estaCargando.set(valor);
}

// ============================================================
// 7. FUNCIÓN CRÍTICA: RESTAURAR SESIÓN DESDE STORAGE
// ============================================================

// Se llama en App.svelte onMount para restaurar sesión si existe
// Implementa: Lectura (READ) + Verificación con BD (IndexedDB)
// Flujo:
// 1. Leer localStorage
// 2. Si existe sesión guardada, verificarla con BD
// 3. Si sigue válida, restaurar usuario
// 4. Si expiró, limpiar todo
export async function restaurarSesionDesdeStorage() {
    try {
        // Leer datos guardados en localStorage
        const usuarioGuardado = localStorage.getItem('usuarioActual');
        const tokenGuardado = localStorage.getItem('tokenSesion');

        // Si no hay datos guardados, salir
        if (!usuarioGuardado || !tokenGuardado) {
            return;
        }

        // Verificar que la sesión sigue válida en la BD
        // Esto comprueba:
        // - Token existe en BD
        // - Token no está expirado
        // - Usuario asociado al token existe
        const resultado = await verificarSesion(tokenGuardado);
        
        if (resultado.valida) {
            // Sesión válida: restaurar usuario en memoria
            usuarioActual.set(resultado.usuario);
            tokenSesion.set(tokenGuardado);
            console.log('Sesion restaurada desde storage');
        } else {
            // Sesión expirada o inválida: limpiar todo
            logout();
            console.log('Sesion expirada o inválida');
        }

    } catch (error) {
        // Si hay error al verificar, limpiar por seguridad
        console.error('Error restaurando sesion:', error);
        logout();
    }
}

// ============================================================
// 8. FUNCIÓN AUXILIAR: OBTENER TOKEN ACTUAL
// ============================================================

// Función sincrónica para obtener el token actual
// Útil cuando necesitas el token para hacer requests
export function obtenerToken() {
    let token;
    // Suscribirse al store, leer valor y dejar de suscribirse
    tokenSesion.subscribe(value => {
        token = value;
    })();
    return token;
}

// ============================================================
// 9. EXPORTAR TODO EL MÓDULO
// ============================================================

export default {
    // Stores para usar en componentes
    usuarioActual,
    tokenSesion,
    errorActual,
    estaCargando,
    estaLogueado,
    tipoUsuario,
    
    // Funciones para manipular el estado
    establecerUsuarioAutenticado,
    actualizarUsuarioActual,
    logout,
    establecerError,
    limpiarError,
    establecerCargando,
    restaurarSesionDesdeStorage,
    obtenerToken
};
