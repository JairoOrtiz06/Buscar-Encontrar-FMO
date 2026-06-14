/**
 * SERVICIO DE IMÁGENES
 * Archivo: src/servicios/imageService.js
 * 
 * Maneja validación y detección de rostros en imágenes
 * Usa face-api.js para detectar si hay un rostro real
 */

import * as faceapi from 'face-api.js';

// Variable global para rastrear si los modelos están cargados
let modelosCargados = false;

/**
 * Cargar modelos de face-api.js
 * Se ejecuta una sola vez al iniciar
 */
export async function cargarModelosFaceAPI() {
    if (modelosCargados) return;
    
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        modelosCargados = true;
        console.log('Modelos de face-api cargados exitosamente');
    } catch (error) {
        console.error('Error cargando modelos de face-api:', error);
        throw new Error('No se pudieron cargar los modelos de detección de rostro');
    }
}

/**
 * Validar que el archivo sea una imagen válida
 * @param {File} archivo - Archivo a validar
 * @returns {object} { valido, error }
 */
export function validarTipoImagen(archivo) {
    if (!archivo) {
        return { valido: false, error: 'Debes seleccionar un archivo' };
    }
    
    const tiposPermitidos = ['image/jpeg', 'image/png'];
    
    if (!tiposPermitidos.includes(archivo.type)) {
        return { valido: false, error: 'Solo se permiten imágenes JPEG o PNG' };
    }
    
    return { valido: true, error: null };
}

/**
 * Validar tamaño de archivo (máximo 5MB)
 * @param {File} archivo - Archivo a validar
 * @returns {object} { valido, error }
 */
export function validarTamanoImagen(archivo) {
    if (!archivo) {
        return { valido: false, error: 'Debes seleccionar un archivo' };
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    
    if (archivo.size > MAX_SIZE) {
        return { valido: false, error: 'La imagen no debe superar 5MB' };
    }
    
    return { valido: true, error: null };
}

/**
 * Convertir archivo a base64
 * @param {File} archivo - Archivo a convertir
 * @returns {Promise<string>} Base64 del archivo
 */
export function convertirABase64(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            resolve(reader.result);
        };
        
        reader.onerror = (error) => {
            reject(new Error('Error leyendo el archivo'));
        };
        
        reader.readAsDataURL(archivo);
    });
}

/**
 * Detectar rostro en imagen usando face-api.js
 * @param {string} imageBase64 - Imagen en base64
 * @returns {Promise<object>} { rostroDetectado, error }
 */
export async function detectarRostro(imageBase64) {
    try {
        // Asegurar que los modelos estén cargados
        await cargarModelosFaceAPI();
        
        // Crear elemento img temporal
        const img = new Image();
        img.src = imageBase64;
        
        // Esperar a que la imagen cargue
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
        });
        
        // Detectar rostros
        const detecciones = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
        
        // Verificar si hay al menos un rostro
        if (detecciones.length === 0) {
            return {
                rostroDetectado: false,
                error: 'No se detectó un rostro en la imagen. Asegúrate de que tu cara sea claramente visible'
            };
        }
        
        // Rostro detectado
        return {
            rostroDetectado: true,
            error: null,
            cantidad: detecciones.length
        };
    } catch (error) {
        console.error('Error detectando rostro:', error);
        return {
            rostroDetectado: false,
            error: 'Error al procesar la imagen. Intenta con otra'
        };
    }
}

/**
 * Validación completa de foto de perfil (con detección de rostro)
 * @param {File} archivo - Archivo a validar
 * @returns {Promise<object>} { valido, error, base64 }
 */
export async function validarFotoPerfil(archivo) {
    // Validar tipo
    const validType = validarTipoImagen(archivo);
    if (!validType.valido) {
        return { valido: false, error: validType.error, base64: null };
    }
    
    // Validar tamaño
    const validSize = validarTamanoImagen(archivo);
    if (!validSize.valido) {
        return { valido: false, error: validSize.error, base64: null };
    }
    
    // Convertir a base64
    let base64;
    try {
        base64 = await convertirABase64(archivo);
    } catch (error) {
        return { valido: false, error: 'Error leyendo la imagen', base64: null };
    }
    
    // Detectar rostro
    const deteccion = await detectarRostro(base64);
    if (!deteccion.rostroDetectado) {
        return { valido: false, error: deteccion.error, base64: null };
    }
    
    return { valido: true, error: null, base64 };
}

/**
 * Validación simple de foto de carnet (SIN detección de rostro)
 * Solo verifica tipo y tamaño
 * @param {File} archivo - Archivo a validar
 * @returns {Promise<object>} { valido, error, base64 }
 */
export async function validarFotoCarnet(archivo) {
    // Validar tipo
    const validType = validarTipoImagen(archivo);
    if (!validType.valido) {
        return { valido: false, error: validType.error, base64: null };
    }
    
    // Validar tamaño
    const validSize = validarTamanoImagen(archivo);
    if (!validSize.valido) {
        return { valido: false, error: validSize.error, base64: null };
    }
    
    // Convertir a base64
    let base64;
    try {
        base64 = await convertirABase64(archivo);
    } catch (error) {
        return { valido: false, error: 'Error leyendo la imagen', base64: null };
    }
    
    return { valido: true, error: null, base64 };
}

export default {
    cargarModelosFaceAPI,
    validarTipoImagen,
    validarTamanoImagen,
    convertirABase64,
    detectarRostro,
    validarFotoPerfil,
    validarFotoCarnet
};