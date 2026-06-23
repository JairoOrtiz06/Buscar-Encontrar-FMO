import { openDB } from 'idb';


/**
 * Crear usuario administrador por defecto en la primera ejecución
 * Solo se crea si no existe ningún admin en la BD
 */
export async function crearAdminPorDefecto() {
    try {
        const db = await dbPromise;
        
        // Verificar si ya existe un admin
       const adminExistente = await db.getFromIndex('usuarios', 'correo', 'ma22013@ues.edu.sv');
        
        if (!adminExistente) {
            // Crear hash de contraseña
            let hash = 0;
            const contrasena = 'Ma22013$UES2022!';
            for (let i = 0; i < contrasena.length; i++) {
                const char = contrasena.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            
            const nuevoAdmin = {
                nombre: 'Yanira Martínez',
                correo: 'ma22013@ues.edu.sv',
                telefono: '7262-7931',
                dui: '06740701-9',
                contrasena: `hash_${Math.abs(hash).toString(16)}`,
                tipo: 'admin',
                validado: true,
                estado: 'aprobado',
                fechaRegistro: new Date().toISOString(),
                codigoInstitucional: 'MA22013'
            };
            
            await db.add('usuarios', nuevoAdmin);
            console.log('Admin por defecto creado: ma22013@ues.edu.sv');
        }
    } catch (error) {
        console.error('Error creando admin por defecto:', error);
    }
}


function crearIndiceSiNoExiste(store, nombre, keyPath, opciones = { unique: false }) {
    if (!store.indexNames.contains(nombre)) {
        store.createIndex(nombre, keyPath, opciones);
    }
}

export const dbPromise = openDB('encuentraUES', 2, {
    upgrade(db, oldVersion, newVersion, transaction) {

        //USUARIOS
        if (!db.objectStoreNames.contains('usuarios')) {
            const store = db.createObjectStore('usuarios', {
                keyPath: 'id',
                autoIncrement: true
            });
            crearIndiceSiNoExiste(store, 'correo', 'correo', { unique: true });
            crearIndiceSiNoExiste(store, 'dui', 'dui', { unique: false });
            crearIndiceSiNoExiste(store, 'carnet', 'carnet', { unique: false });
            crearIndiceSiNoExiste(store, 'tipo', 'tipo', { unique: false });
            crearIndiceSiNoExiste(store, 'validado', 'validado', { unique: false });
        } else {
            const store = transaction.objectStore('usuarios');
            crearIndiceSiNoExiste(store, 'correo', 'correo', { unique: true });
            crearIndiceSiNoExiste(store, 'dui', 'dui', { unique: false });
            crearIndiceSiNoExiste(store, 'carnet', 'carnet', { unique: false });
            crearIndiceSiNoExiste(store, 'tipo', 'tipo', { unique: false });
            crearIndiceSiNoExiste(store, 'validado', 'validado', { unique: false });
        }

        if (!db.objectStoreNames.contains('sesiones')) {
            db.createObjectStore('sesiones', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('fotos')) {
            const storefotos = db.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true });
            storefotos.createIndex('idUsuario', 'idUsuario', { unique: false });
            storefotos.createIndex('tipo', 'tipo', { unique: false });
        }

        //OBJETOS
        if (!db.objectStoreNames.contains('objetos')) {
            const store = db.createObjectStore('objetos', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('categoria', 'categoria', { unique: false });
            store.createIndex('estado', 'estado', { unique: false });
            store.createIndex('idUsuario', 'idUsuario', { unique: false });
            store.createIndex('fechaPublicacion', 'fechaPublicacion', { unique: false });
        }

        //RECLAMOS
        if (!db.objectStoreNames.contains('reclamos')) {
            const store = db.createObjectStore('reclamos', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('idObjeto', 'idObjeto', { unique: false });
            store.createIndex('idSolicitante', 'idSolicitante', { unique: false });
            store.createIndex('estado', 'estado', { unique: false });
            store.createIndex('fechaSolicitud', 'fechaSolicitud', { unique: false });
        }

        //ENTREGAS 
        if (!db.objectStoreNames.contains('entregas')) {
            const store = db.createObjectStore('entregas', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('idObjeto', 'idObjeto', { unique: false });
            store.createIndex('idReclamo', 'idReclamo', { unique: false });
            store.createIndex('fechaEntrega', 'fechaEntrega', { unique: false });
        }

    }
});
