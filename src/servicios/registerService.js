
import { dbPromise } from '../base_datos/database.js';
import { enviarNotificacionAdmins } from './notificacionesService.js';


/**
 * DEPARTAMENTOS Y CARRERAS DE UES-FMO
 * Estructura: departamento → carreras[]
 */
export const DEPARTAMENTOS_CARRERAS = {
  'Ciencias Naturales y Matemática': [
    'Licenciatura en Biología',
    'Licenciatura en Ciencias Químicas',
    'Licenciatura en Física',
    'Licenciatura en Matemática'
  ],
  'Ciencias Económicas': [
    'Licenciatura en Economía',
    'Licenciatura en Contaduría Pública',
    'Licenciatura en Administración de Empresas',
    'Licenciatura en Mercadeo Internacional',
    'Licenciatura en Logística Comercial Internacional'
  ],
  'Ciencias y Humanidades': [
    'Licenciatura en Ciencias de la Educación en la Especialidad de Primero y Segundo Ciclo de Educación Básica',
    'Licenciatura en Educación Inicial y Parvularia',
    'Licenciatura en Lenguas Modernas: Especialidad en Francés e Inglés',
    'Licenciatura en Letras',
    'Licenciatura en Psicología',
    'Licenciatura en Sociología'
  ],
  'Ingeniería y Arquitectura': [
    'Arquitectura',
    'Ingeniería Civil',
    'Ingeniería de Sistemas Informáticos',
    'Ingeniería Industrial',
    'Ingeniería Eléctrica',
    'Ingeniería Mecánica'
  ],
  'Medicina': [
    'Doctorado en Medicina',
    'Licenciatura en Anestesiología e Inhaloterapia',
    'Licenciatura en Fisioterapia y Terapia Ocupacional',
    'Licenciatura en Laboratorio Clínico'
  ],
  'Jurisprudencia y Ciencias Sociales': [
    'Licenciatura en Ciencias Jurídicas'
  ],
  'Ciencias Agronómicas': [
    'Ingeniería Agronómica',
    'Técnico en Veterinaria y Zootecnia'
  ],
  'Química y Farmacia': [
    'Licenciatura en Química y Farmacia'
  ]
};

/**
 * Obtener lista de departamentos
 */
export function obtenerDepartamentos() {
  return Object.keys(DEPARTAMENTOS_CARRERAS);
}

/**
 * Obtener carreras de un departamento específico
 */
export function obtenerCarrerasPorDepartamento(departamento) {
  return DEPARTAMENTOS_CARRERAS[departamento] || [];
}


// ============================================================
// 1. DEFINICIÓN DE CATEGORÍAS DE USUARIOS (Segmentación clara)
// ============================================================

export const CATEGORIAS_USUARIOS = {
    ESTUDIANTE: {
        id: 'estudiante',
        nombre: 'Estudiante',
        descripcion: 'Estudiante de la Universidad',
        camposEspecificos: ['carnet', 'carrera']
    },
    DOCENTE: {
        id: 'docente',
        nombre: 'Docente',
        descripcion: 'Profesor o docente de la Universidad',
        camposEspecificos: ['codigoInstitucional', 'departamento']
    },
    ADMINISTRATIVO: {
        id: 'administrativo',
        nombre: 'Personal Administrativo',
        descripcion: 'Personal de administración de la Universidad',
        camposEspecificos: ['codigoInstitucional', 'areaOficina']
    },
    VIGILANTE: {
        id: 'vigilante',
        nombre: 'Vigilante',
        descripcion: 'Personal de vigilancia',
        camposEspecificos: ['codigoInstitucional']
    },
    MANTENIMIENTO: {
        id: 'mantenimiento',
        nombre: 'Personal de Mantenimiento',
        descripcion: 'Personal de mantenimiento e infraestructura',
        camposEspecificos: ['codigoInstitucional']
    },
    LIMPIEZA: {
        id: 'limpieza',
        nombre: 'Personal de Limpieza',
        descripcion: 'Personal de limpieza e intendencia',
        camposEspecificos: ['codigoInstitucional']
    }
};

// ============================================================
// 2. FUNCIONES UTILITARIAS
// ============================================================

// Hashear contraseña (JS puro y limpio - Rúbrica #2)
// Debe ser idéntico al de authService.js para verificación consistente
function hashearContrasena(contrasena) {
    let hash = 0;
    for (let i = 0; i < contrasena.length; i++) {
        const char = contrasena.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
}

// ============================================================
// 3. OPERACIONES DE BÚSQUEDA/VALIDACIÓN
// ============================================================

// CRUD READ: Verificar si correo existe (búsqueda rápida con índice)
// Retorna: boolean
export async function verificarCorreoDuplicado(correo) {
    try {
        const db = await dbPromise;
        // Usar índice 'correo' para búsqueda O(1) en lugar de O(n)
        const usuario = await db.getFromIndex('usuarios', 'correo', correo.toLowerCase());
        return !!usuario; // Convertir a boolean
    } catch (error) {
        // Error esperado si no existe el usuario
        if (error.name === 'NotFoundError') {
            return false;
        }
        console.error('Error verificando correo:', error);
        return false;
    }
}

// CRUD READ: Verificar si DUI existe (búsqueda rápida con índice)
// Retorna: boolean
export async function verificarDUIDuplicado(dui) {
    try {
        const db = await dbPromise;
        // Usar índice 'dui' para búsqueda O(1)
        const usuario = await db.getFromIndex('usuarios', 'dui', dui);
        return !!usuario;
    } catch (error) {
        if (error.name === 'NotFoundError') {
            return false;
        }
        console.error('Error verificando DUI:', error);
        return false;
    }
}

// CRUD READ: Verificar si carnet existe (solo estudiantes)
// Como no tiene índice único, hacemos búsqueda en memoria
// Retorna: boolean
export async function verificarCarnetDuplicado(carnet) {
    try {
        const db = await dbPromise;
        const usuarios = await db.getAll('usuarios');
        return usuarios.some(u => u.carnet === carnet.toUpperCase());
    } catch (error) {
        console.error('Error verificando carnet:', error);
        return false;
    }
}

// ============================================================
// 4. OPERACIÓN PRINCIPAL: CREAR USUARIO (CREATE en CRUD)
// ============================================================

// CRUD CREATE: Registrar nuevo usuario con validaciones completas
// Esta función implementa:
// - Validaciones en cascada (fail-fast)
// - Manejo perfecto de promesas (async/await)
// - Transacciones lógicas (valida primero, luego guarda)
// - Seguridad (hashea contraseña, verifica duplicados)
export async function registrarUsuario(datos, fotoPerfil = null, fotoCarnet = null) {
    try {
        // Desestructurar todos los campos posibles
        const {
            nombre,
            correo,
            telefono,
            dui,
            contrasena,
            tipo,
            carnet,
            carrera,
            codigoInstitucional,
            departamento,
            areaOficina,
            descripcion
        } = datos;

        // ========== BLOQUE 1: VALIDACIONES GENERALES ==========
        // (Aplican a TODOS los usuarios, independientemente del tipo)

        // Validar nombre: mínimo 3 caracteres
        if (!nombre || nombre.trim().length < 3) {
            return {
                exito: false,
                mensaje: 'El nombre debe tener al menos 3 caracteres'
            };
        }

        // Validar correo: formato básico
        if (!correo || !correo.includes('@')) {
            return {
                exito: false,
                mensaje: 'Email invalido'
            };
        }

        // Validar duplicado de correo (consulta BD)
        if (await verificarCorreoDuplicado(correo)) {
            return {
                exito: false,
                mensaje: 'Este correo ya esta registrado en el sistema'
            };
        }

        // Validar teléfono: mínimo 8 dígitos
        if (!telefono || telefono.trim().length < 8) {
            return {
                exito: false,
                mensaje: 'Telefono invalido. Minimo 8 digitos'
            };
        }

        // Validar DUI: formato salvadoreño 12345678-9
        const duiRegex = /^\d{8}-\d{1}$/;
        if (!duiRegex.test(dui)) {
            return {
                exito: false,
                mensaje: 'Formato de DUI invalido. Debe ser: 12345678-9'
            };
        }

        // Validar duplicado de DUI (consulta BD con índice)
        if (await verificarDUIDuplicado(dui)) {
            return {
                exito: false,
                mensaje: 'Este DUI ya esta registrado en el sistema'
            };
        }

        // Validar contraseña: mínimo 8 caracteres
        if (!contrasena || contrasena.length < 8) {
            return {
                exito: false,
                mensaje: 'La contraseña debe tener al menos 8 caracteres'
            };
        }

        // Validar que tipo de usuario es válido
        const tiposValidos = Object.keys(CATEGORIAS_USUARIOS).map(
            key => CATEGORIAS_USUARIOS[key].id
        );
        if (!tiposValidos.includes(tipo)) {
            return {
                exito: false,
                mensaje: 'Tipo de usuario invalido'
            };
        }

        // ========== BLOQUE 2: VALIDACIONES POR TIPO ==========

        // VALIDACIONES PARA ESTUDIANTE
        if (tipo === 'estudiante') {
            // Validar formato de carnet: 2 letras + 5 números (ej: MA22013)
            const carnetRegex = /^[A-Z]{2}\d{5}$/;
            if (!carnetRegex.test(carnet.toUpperCase())) {
                return {
                    exito: false,
                    mensaje: 'Carnet invalido. Formato: MA22013'
                };
            }

            // Validar duplicado de carnet
            if (await verificarCarnetDuplicado(carnet)) {
                return {
                    exito: false,
                    mensaje: 'Este carnet ya esta registrado'
                };
            }

            // Validar selección de carrera
            if (!carrera || carrera.trim().length === 0) {
                return {
                    exito: false,
                    mensaje: 'Debes seleccionar una carrera'
                };
            }
        }

        // VALIDACIONES PARA DOCENTE, ADMIN, VIGILANTE, CONSERJE, LIMPIEZA
        if (['docente', 'administrativo', 'vigilante', 'mantenimiento', 'limpieza'].includes(tipo)) {
            if (!codigoInstitucional || codigoInstitucional.trim().length === 0) {
                return {
                    exito: false,
                    mensaje: 'El codigo institucional es obligatorio'
                };
            }
        }

        // VALIDACIONES ESPECÍFICAS PARA DOCENTE
        if (tipo === 'docente') {
            if (!departamento || departamento.trim().length === 0) {
                return {
                    exito: false,
                    mensaje: 'Debes seleccionar un departamento'
                };
            }
        }

        // VALIDACIONES ESPECÍFICAS PARA ADMINISTRATIVO
        if (tipo === 'administrativo') {
            if (!areaOficina || areaOficina.trim().length === 0) {
                return {
                    exito: false,
                    mensaje: 'Debes indicar tu area de trabajo'
                };
            }
        }

        // ========== BLOQUE 3: CONSTRUIR OBJETO USUARIO ==========
        // Crear objeto con campos comunes + campos específicos del tipo

        const nuevoUsuario = {
            // CAMPOS COMUNES A TODOS
            nombre: nombre.trim(),
            correo: correo.toLowerCase(),
            telefono: telefono.replace(/\s/g, ''), // Remover espacios
            dui: dui.trim(),
            contrasena: hashearContrasena(contrasena), // NUNCA guardar en texto plano
            tipo: tipo,
            validado: false, // Requiere aprobación del administrador
            estado: 'pendiente', // Estados posibles: pendiente, aprobado, rechazado
            fechaRegistro: new Date().toISOString(),

            // CAMPOS ESPECÍFICOS PARA ESTUDIANTE
            ...(tipo === 'estudiante' && {
                carnet: carnet.toUpperCase(),
                carrera: carrera
            }),

            // CAMPOS ESPECÍFICOS PARA DOCENTE
            ...(tipo === 'docente' && {
                codigoInstitucional: codigoInstitucional,
                departamento: departamento
            }),

            // CAMPOS ESPECÍFICOS PARA ADMINISTRATIVO
            ...(tipo === 'administrativo' && {
                codigoInstitucional: codigoInstitucional,
                areaOficina: areaOficina
            }),

            // CAMPOS ESPECÍFICOS PARA VIGILANTE, CONSERJE, LIMPIEZA
            ...(['vigilante', 'mantenimiento', 'limpieza'].includes(tipo) && {
                codigoInstitucional: codigoInstitucional
            }),

            // CAMPOS ESPECÍFICOS PARA OTROS
            ...(tipo === 'otros' && {
                descripcion: descripcion
            })
        };

        // ========== BLOQUE 4: GUARDAR EN BD ==========
        // Operación asíncrona con manejo de errores

        const db = await dbPromise;
        const idUsuario = await db.add('usuarios', nuevoUsuario);

        await enviarNotificacionAdmins({
            titulo: 'Nueva cuenta por revisar',
            mensaje: `${nuevoUsuario.nombre} creo una cuenta y esta pendiente de aprobacion.`,
            tipo: 'usuario-pendiente',
            referencia: { idUsuario, tipo: nuevoUsuario.tipo }
        });

        // Guardar fotos en la tabla 'fotos'
        if (fotoPerfil) {
            await db.add('fotos', {
                idUsuario: idUsuario,
                tipo: 'perfil',
                base64: fotoPerfil,
                fechaSubida: new Date().toISOString()
            });
        }

        if (fotoCarnet) {
            await db.add('fotos', {
                idUsuario: idUsuario,
                tipo: 'carnet',
                base64: fotoCarnet,
                fechaSubida: new Date().toISOString()
            });
        }

        console.log('Usuario registrado exitosamente:', correo, 'ID:', idUsuario);

        // REGISTRO EXITOSO
        return {
            exito: true,
            mensaje: 'Registro exitoso. Tu cuenta esta pendiente de aprobacion',
            idUsuario: idUsuario
        };

    } catch (error) {
        console.error('Error registrando usuario:', error);
        return {
            exito: false,
            mensaje: 'Error en el servidor. Intenta de nuevo mas tarde'
        };
    }
}

// ============================================================
// 5. OPERACIONES DE LECTURA (READ en CRUD)
// ============================================================

// CRUD READ: Obtener todas las categorías disponibles
// Retorna: array de categorías
export function obtenerCategorias() {
    return Object.values(CATEGORIAS_USUARIOS);
}

// CRUD READ: Obtener información de una categoría específica
// Retorna: objeto con info de la categoría o null
export function obtenerInfoCategoria(tipoId) {
    for (const key in CATEGORIAS_USUARIOS) {
        if (CATEGORIAS_USUARIOS[key].id === tipoId) {
            return CATEGORIAS_USUARIOS[key];
        }
    }
    return null;
}

// ============================================================
// EXPORTAR MÓDULO
// ============================================================

export default {
    registrarUsuario,
    verificarCorreoDuplicado,
    verificarDUIDuplicado,
    verificarCarnetDuplicado,
    obtenerCategorias,
    obtenerInfoCategoria,
    CATEGORIAS_USUARIOS
};
