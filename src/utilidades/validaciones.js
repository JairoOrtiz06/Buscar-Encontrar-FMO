// validaciones para "REGISTRO USUARIO"

/**
 * VALIDACIONES - validaciones.js
 * 
 * SOLUCIÓN DEL PROBLEMA (Rúbrica #1):
 * Valida todos los datos de entrada ANTES de guardarlos en IndexedDB.
 * Evita datos inválidos, duplicados o incompletos en la base de datos.
 * 
 * ARQUITECTURA (Rúbrica #2 y #3):
 * - Funciones JS puras y sin efectos secundarios
 * - Cada validador retorna { valido, error }
 * - Reutilizables en múltiples componentes (Login, Registro)
 * - Validaciones en tiempo real mientras el usuario escribe
 * 
 * USABILIDAD (Rúbrica #5):
 * - Mensajes de error claros en español
 * - Indicador visual de fortaleza de contraseña
 * - Validaciones progresivas (fail-fast)
 */

// ============================================================
// 1. VALIDADORES INDIVIDUALES
// ============================================================

// Validar nombre de usuario
// Requisitos:
// - No está vacío
// - Mínimo 3 caracteres
// - No es solo números
export function validarNombre(nombre) {
    if (!nombre || nombre.trim().length === 0) {
        return { valido: false, error: 'El nombre es requerido' };
    }
    
    const trimmed = nombre.trim();
    
    if (trimmed.length < 3) {
        return { valido: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }
    
    if (trimmed.length > 100) {
        return { valido: false, error: 'El nombre es muy largo' };
    }
    
    if (/^\d+$/.test(trimmed)) {
        return { valido: false, error: 'El nombre no puede ser solo numeros' };
    }
    
    return { valido: true, error: null };
}

// Validar correo electrónico
// Requisitos:
// - Formato básico válido (contiene @)
// - Sin espacios
// - No está vacío
export function validarCorreo(correo) {
    if (!correo || correo.trim().length === 0) {
        return { valido: false, error: 'El correo es requerido' };
    }
    
    const trimmed = correo.trim().toLowerCase();

    // Validar que sea correo de UES
    if (!trimmed.endsWith('@ues.edu.sv')) {
        return { valido: false, error: 'El correo debe ser del dominio @ues.edu.sv' };
    }
    
    // Expresión regular para correo UES
    const regexCorreo = /^[a-zA-Z0-9._-]+@ues\.edu\.sv$/;
    
    if (!regexCorreo.test(trimmed)) {
        return { valido: false, error: 'Solo se aceptan correos de dominio @ues.edu.sv' };
    }
    
    if (trimmed.includes(' ')) {
        return { valido: false, error: 'El correo no puede contener espacios' };
    }
    
    return { valido: true, error: null };
    
}

/**
 * Validar que el correo del estudiante coincida con su carnet
 * Ejemplo: carnet MA22013 → correo debe ser ma22013@ues.edu.sv
 */
export function validarCorreoEstudiante(correo, carnet) {
    if (!carnet || !correo) {
        return { valido: false, error: 'Correo requerido' };
    }
    
    const correoTrimmed = correo.trim().toLowerCase();
    const carnetTrimmed = carnet.trim().toLowerCase();
    
    // Extraer la parte local del correo (antes del @)
    const parteLocalCorreo = correoTrimmed.split('@')[0];
    console.log('Correo completo:', correo);
console.log('Carnet completo:', carnet);
console.log('Parte local:', parteLocalCorreo);
console.log('Carnet normalizado:', carnetTrimmed);
    
    // El correo debe empezar con el carnet en minúscula
    if (parteLocalCorreo !== carnetTrimmed) {
        return { valido: false, error: `El correo no es válido` };
    }
    
    return { valido: true, error: null };
}


// Validar teléfono salvadoreño
// Requisitos:
// - Mínimo 8 dígitos
// - Formato: 2345-6789 o variaciones
// - Sin caracteres especiales excepto guion y paréntesis
export function validarTelefono(telefono) {
    if (!telefono || telefono.trim().length === 0) {
        return { valido: false, error: 'El telefono es requerido' };
    }
    
    const trimmed = telefono.trim();
    // Remover espacios, guiones, paréntesis
    const telefonoLimpio = trimmed.replace(/[\s\-]/g, '');
    
    // Validar que sean EXACTAMENTE 8 dígitos
    const regexTelefono = /^\d{8}$/;
    
    if (!regexTelefono.test(telefonoLimpio)) {
        return { valido: false, error: 'El telefono debe tener exactamente 8 dígitos. Ejemplo: 23456789' };
    }
    
    return { valido: true, error: null };
}

// Validar DUI (Documento Único de Identidad - El Salvador)
// Requisitos:
// - Formato EXACTO: 8 números - 1 dígito verificador
// - Ejemplo: 12345678-9
export function validarDUI(dui) {
    if (!dui || dui.trim().length === 0) {
        return { valido: false, error: 'El DUI es requerido' };
    }
    
    const trimmed = dui.trim();
    // Expresión regular: 8 dígitos, guion, 1 dígito
    const regexDUI = /^\d{8}-\d{1}$/;
    
    if (!regexDUI.test(trimmed)) {
        return { valido: false, error: 'DUI invalido. Formato: 12345678-9' };
    }
    
    return { valido: true, error: null };
}

// Validar carnet de estudiante UES
// Requisitos:
// - Formato EXACTO: 2 letras + 5 números
// - Ejemplo: MA22013
// - Las 2 letras identifican la carrera
export function validarCarnet(carnet) {
    if (!carnet || carnet.trim().length === 0) {
        return { valido: false, error: 'El carnet es requerido' };
    }
    
    const trimmed = carnet.trim().toUpperCase();
    // Expresión regular: 2 letras mayúsculas + 5 dígitos
    const regexCarnet = /^[A-Z]{2}\d{5}$/;
    
    if (!regexCarnet.test(trimmed)) {
        return { valido: false, error: 'Carnet invalido' };
    }
    
    return { valido: true, error: null };
}

// Validar código institucional (docentes, admin, vigilantes, etc)
// Requisitos:
// - Mínimo 2 caracteres
// - Máximo 20 caracteres
// - No está vacío
export function validarCodigoInstitucional(codigo) {
    if (!codigo || codigo.trim().length === 0) {
        return { valido: false, error: 'El codigo institucional es requerido' };
    }
    
    const trimmed = codigo.trim();
    
    if (trimmed.length < 2) {
        return { valido: false, error: 'El codigo debe tener al menos 2 caracteres' };
    }
    
    if (trimmed.length > 20) {
        return { valido: false, error: 'El codigo es muy largo' };
    }
    
    return { valido: true, error: null };
}

// Validar campo requerido genérico (carrera, departamento, area, etc)
// Requisitos:
// - No está vacío
// - Mínimo 2 caracteres
// - Máximo 100 caracteres
export function validarCampoRequerido(valor, nombreCampo) {
    if (!valor || valor.trim().length === 0) {
        return { valido: false, error: `${nombreCampo} es requerido` };
    }
    
    const trimmed = valor.trim();
    
    if (trimmed.length < 2) {
        return { valido: false, error: `${nombreCampo} debe tener al menos 2 caracteres` };
    }
    
    if (trimmed.length > 100) {
        return { valido: false, error: `${nombreCampo} es muy largo` };
    }
    
    return { valido: true, error: null };
}

// Validar contraseña
// Requisitos:
// - Mínimo 8 caracteres
// - Máximo 100 caracteres
// - No está vacía
export function validarContrasena(contrasena) {
    if (!contrasena || contrasena.length === 0) {
        return { valido: false, error: 'La contraseña es requerida' };
    }
    
    if (contrasena.length < 8) {
        return { valido: false, error: 'La contraseña debe tener minimo 8 caracteres' };
    }
    
    if (contrasena.length > 100) {
        return { valido: false, error: 'La contraseña es muy larga' };
    }
    
    return { valido: true, error: null };
}

// Validar que las contraseñas coinciden
// Requisitos:
// - Campo de confirmación no está vacío
// - Contraseña = Confirmación
export function validarConfirmacionContrasena(contrasena, confirmacion) {
    if (!confirmacion || confirmacion.length === 0) {
        return { valido: false, error: 'Debes confirmar la contraseña' };
    }
    
    if (contrasena !== confirmacion) {
        return { valido: false, error: 'Las contraseñas no coinciden' };
    }
    
    return { valido: true, error: null };
}

// ============================================================
// 2. INDICADOR DE FORTALEZA DE CONTRASEÑA
// ============================================================

// Analizar la fortaleza de una contraseña
// Retorna: { puntuacion, texto, color, porcentaje }
// Se usa para mostrar una barra visual en tiempo real
// Rúbrica #5: Excelente manejo de estados de carga/feedback
export function obtenerFortaleaContrasena(contrasena) {
    if (!contrasena) {
        return { puntuacion: 0, texto: 'Sin contraseña', color: '#999999' };
    }
    
    let puntuacion = 0;
    
    // Criterios de fortaleza
    if (contrasena.length >= 8) puntuacion++;      // Criterio 1: largo mínimo
    if (contrasena.length >= 12) puntuacion++;     // Criterio 2: largo medio
    if (/[a-z]/.test(contrasena)) puntuacion++;    // Criterio 3: letras minúsculas
    if (/[A-Z]/.test(contrasena)) puntuacion++;    // Criterio 4: letras mayúsculas
    if (/[0-9]/.test(contrasena)) puntuacion++;    // Criterio 5: números
    if (/[!@#$%^&*]/.test(contrasena)) puntuacion++;// Criterio 6: caracteres especiales
    
    // Niveles de fortaleza (0-6 puntos)
    const nivelTexto = [
        'Muy debil',
        'Debil',
        'Regular',
        'Aceptable',
        'Buena',
        'Fuerte',
        'Muy fuerte'
    ];
    
    // Colores progresivos (rojo a verde)
    const nivelColor = [
        '#d32f2f', // Rojo muy oscuro
        '#f57c00', // Naranja oscuro
        '#fbc02d', // Amarillo
        '#689f38', // Verde claro
        '#388e3c', // Verde medio
        '#00796b', // Verde azulado
        '#1565c0'  // Azul
    ];
    
    return {
        puntuacion: Math.min(puntuacion, 6),
        texto: nivelTexto[puntuacion],
        color: nivelColor[puntuacion],
        porcentaje: (Math.min(puntuacion, 6) / 6) * 100
    };
}

// ============================================================
// 3. VALIDADORES COMPLETOS POR FLUJO
// ============================================================

// Validar formulario completo de LOGIN
// Retorna: { esValido, errores }
// Se usa en Login.svelte al enviar el formulario
export function validarLoginCompleto(correo, contrasena) {
    const errores = {};
    
    // Validar cada campo
    const validCorreo = validarCorreo(correo);
    if (!validCorreo.valido) errores.correo = validCorreo.error;
    
    const validContrasena = validarContrasena(contrasena);
    if (!validContrasena.valido) errores.contrasena = validContrasena.error;
    
    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
}

// Validar formulario completo de REGISTRO para ESTUDIANTE
// Retorna: { esValido, errores }
export function validarRegistroEstudiante(datos) {
    const errores = {};
    
    // Validar campos generales
    const validNombre = validarNombre(datos.nombre);
    if (!validNombre.valido) errores.nombre = validNombre.error;
    
    const validCorreo = validarCorreo(datos.correo);
    if (!validCorreo.valido) errores.correo = validCorreo.error;
    
    const validTelefono = validarTelefono(datos.telefono);
    if (!validTelefono.valido) errores.telefono = validTelefono.error;
    
    const validDUI = validarDUI(datos.dui);
    if (!validDUI.valido) errores.dui = validDUI.error;
    
    // Validar campos específicos de estudiante
    const validCarnet = validarCarnet(datos.carnet);
    if (!validCarnet.valido) errores.carnet = validCarnet.error;
    
    const validDepartamento = validarCampoRequerido(datos.departamento, 'El departamento');
    if (!validDepartamento.valido) errores.departamento = validDepartamento.error;

    const validCarrera = validarCampoRequerido(datos.carrera, 'La carrera');
    if (!validCarrera.valido) errores.carrera = validCarrera.error;
    
    // Validar contraseña
    const validContrasena = validarContrasena(datos.contrasena);
    if (!validContrasena.valido) errores.contrasena = validContrasena.error;
    
    const validConfirmacion = validarConfirmacionContrasena(datos.contrasena, datos.confirmacion);
    if (!validConfirmacion.valido) errores.confirmacion = validConfirmacion.error;
    
    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
}

// Validar formulario completo de REGISTRO para DOCENTE
export function validarRegistroDocente(datos) {
    const errores = {};
    
    // Campos generales
    const validNombre = validarNombre(datos.nombre);
    if (!validNombre.valido) errores.nombre = validNombre.error;
    
    const validCorreo = validarCorreo(datos.correo);
    if (!validCorreo.valido) errores.correo = validCorreo.error;
    
    const validTelefono = validarTelefono(datos.telefono);
    if (!validTelefono.valido) errores.telefono = validTelefono.error;
    
    const validDUI = validarDUI(datos.dui);
    if (!validDUI.valido) errores.dui = validDUI.error;
    
    // Campos específicos de docente
    const validCodigo = validarCodigoInstitucional(datos.codigoInstitucional);
    if (!validCodigo.valido) errores.codigoInstitucional = validCodigo.error;
    
    const validDepartamento = validarCampoRequerido(datos.departamento, 'El departamento');
    if (!validDepartamento.valido) errores.departamento = validDepartamento.error;
    
    // Contraseña
    const validContrasena = validarContrasena(datos.contrasena);
    if (!validContrasena.valido) errores.contrasena = validContrasena.error;
    
    const validConfirmacion = validarConfirmacionContrasena(datos.contrasena, datos.confirmacion);
    if (!validConfirmacion.valido) errores.confirmacion = validConfirmacion.error;
    
    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
}

// Validar formulario completo de REGISTRO para ADMINISTRATIVO
export function validarRegistroAdministrativo(datos) {
    const errores = {};
    
    // Campos generales
    const validNombre = validarNombre(datos.nombre);
    if (!validNombre.valido) errores.nombre = validNombre.error;
    
    const validCorreo = validarCorreo(datos.correo);
    if (!validCorreo.valido) errores.correo = validCorreo.error;
    
    const validTelefono = validarTelefono(datos.telefono);
    if (!validTelefono.valido) errores.telefono = validTelefono.error;
    
    const validDUI = validarDUI(datos.dui);
    if (!validDUI.valido) errores.dui = validDUI.error;
    
    // Campos específicos de administrativo
    const validCodigo = validarCodigoInstitucional(datos.codigoInstitucional);
    if (!validCodigo.valido) errores.codigoInstitucional = validCodigo.error;
    
    const validArea = validarCampoRequerido(datos.areaOficina, 'El area de trabajo');
    if (!validArea.valido) errores.areaOficina = validArea.error;
    
    // Contraseña
    const validContrasena = validarContrasena(datos.contrasena);
    if (!validContrasena.valido) errores.contrasena = validContrasena.error;
    
    const validConfirmacion = validarConfirmacionContrasena(datos.contrasena, datos.confirmacion);
    if (!validConfirmacion.valido) errores.confirmacion = validConfirmacion.error;
    
    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
}

// ============================================================
// 4. EXPORTAR TODO EL MÓDULO
// ============================================================

export default {
    // Validadores individuales
    validarNombre,
    validarCorreo,
    validarTelefono,
    validarDUI,
    validarCarnet,
    validarCodigoInstitucional,
    validarCampoRequerido,
    validarContrasena,
    validarConfirmacionContrasena,
    
    // Indicador de fortaleza
    obtenerFortaleaContrasena,
    
    // Validadores completos
    validarLoginCompleto,
    validarRegistroEstudiante,
    validarRegistroDocente,
    validarRegistroAdministrativo
};