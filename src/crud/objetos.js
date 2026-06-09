
import { dbPromise } from '../base_datos/database.js';

// CREATE - Crear objeto

// Verificar si ya existe un objeto con datos similares
export async function verificarDuplicado(titulo, categoria, ubicacion) {

    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    
    // Buscar objetos con mismo título y categoría 
    const tituloLower = titulo.toLowerCase().trim();
    const categoriaLower = categoria.toLowerCase().trim();
    const ubicacionLower = ubicacion.toLowerCase().trim();
    
    const duplicado = objetos.find(o => 

        o.estado !== 'eliminado' &&
        o.titulo.toLowerCase().trim() === tituloLower &&
        o.categoria.toLowerCase().trim() === categoriaLower &&
        o.ubicacion.toLowerCase().trim() === ubicacionLower
    );
    
    return duplicado || null;
}

// Crear nuevo objeto
export async function crearObjeto(objeto) {
    // Verificar duplicado primero
    const duplicado = await verificarDuplicado(
        objeto.titulo, 
        objeto.categoria, 
        objeto.ubicacion
    );
    
    if (duplicado) {
        throw new Error('DUPLICADO');
    }
    
    const db = await dbPromise;
    const id = await db.add('objetos', {
        ...objeto,
        estado: 'pendiente',
        fechaPublicacion: new Date().toISOString()
    });
    return id;
}

// READ - Obtener objetos

// Obtener todos los objetos (excluyendo eliminados)
export async function getObjetos() {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos.filter(o => o.estado !== 'eliminado');
}

// Obtener un objeto por ID
export async function getObjeto(id) {
    const db = await dbPromise;
    return await db.get('objetos', id);
}

// Obtener objetos por categoría
export async function getObjetosPorCategoria(categoria) {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos.filter(o => 
        o.estado !== 'eliminado' && 
        o.categoria === categoria
    );
}

// Obtener objetos por estado
export async function getObjetosPorEstado(estado) {
    const db = await dbPromise;
    return await db.getAllFromIndex('objetos', 'estado', estado);
}

// Obtener objetos disponibles (pendiente)
export async function getObjetosDisponibles() {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos.filter(o => o.estado === 'pendiente');
}

// Obtener objetos por usuario
export async function getObjetosPorUsuario(idUsuario) {
    const db = await dbPromise;
    return await db.getAllFromIndex('objetos', 'idUsuario', idUsuario);
}

// Buscar objetos por texto
export async function buscarObjetos(texto) {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    const busqueda = texto.toLowerCase();
    
    return objetos.filter(o => 
        o.estado !== 'eliminado' && (
            o.titulo.toLowerCase().includes(busqueda) ||
            (o.descripcion && o.descripcion.toLowerCase().includes(busqueda))
        )
    );
}

// UPDATE - Actualizar objetos

// Actualizar un objeto completo
export async function actualizarObjeto(id, datos) {
    const db = await dbPromise;
    const objeto = await db.get('objetos', id);
    if (!objeto) throw new Error('Objeto no encontrado');
    
    return await db.put('objetos', { ...objeto, ...datos });
}

// Actualizar solo el estado
export async function actualizarEstado(id, estado) {
    const db = await dbPromise;
    const objeto = await db.get('objetos', id);
    if (!objeto) throw new Error('Objeto no encontrado');
    
    objeto.estado = estado;
    return await db.put('objetos', objeto);
}

// DELETE - "Eliminar" (cambiar estado)

// "Eliminar" un objeto - cambia estado a eliminado
export async function eliminarObjeto(id) {
    const db = await dbPromise;
    const objeto = await db.get('objetos', id);
    if (!objeto) throw new Error('Objeto no encontrado');
    
    objeto.estado = 'eliminado';
    return await db.put('objetos', objeto);
}

// Restaurar objeto eliminado
export async function restaurarObjeto(id) {
    const db = await dbPromise;
    const objeto = await db.get('objetos', id);
    if (!objeto) throw new Error('Objeto no encontrado');
    
    objeto.estado = 'pendiente';
    return await db.put('objetos', objeto);
}

// ESTADÍSTICAS

export async function getEstadisticas() {
    const objetos = await getObjetos();
    
    return {
        total: objetos.length,
        pendientes: objetos.filter(o => o.estado === 'pendiente').length,
        reclamados: objetos.filter(o => o.estado === 'reclamado').length,
        entregado: objetos.filter(o => o.estado === 'entregado').length,
        archivado: objetos.filter(o => o.estado === 'archivado').length
    };
}


// HISTORIAL - Ver publicaciones del usuario    
// Obtener historial de un usuario específico
export async function getHistorialUsuario(idUsuario) {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos
        .filter(o => o.idUsuario === idUsuario && o.estado !== 'eliminado')
        .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
}

// Obtener historial filtrado por estado
export async function getHistorialPorEstado(idUsuario, estado) {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos
        .filter(o => o.idUsuario === idUsuario && o.estado === estado)
        .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
}

// Obtener todos los objetos eliminados del usuario
export async function getEliminados(idUsuario) {
    const db = await dbPromise;
    const objetos = await db.getAll('objetos');
    return objetos
        .filter(o => o.idUsuario === idUsuario && o.estado === 'eliminado')
        .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
}