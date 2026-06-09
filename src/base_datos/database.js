import { openDB } from 'idb';

export const dbPromise = openDB('encuentraUES', 1, {
    upgrade(db) {

        //USUARIOS
        if (!db.objectStoreNames.contains('usuarios')) {
            const store = db.createObjectStore('usuarios', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('correo', 'correo', { unique: true });
            store.createIndex('carnet', 'carnet', { unique: false });
            store.createIndex('tipo', 'tipo', { unique: false });
            store.createIndex('validado', 'validado', { unique: false });
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