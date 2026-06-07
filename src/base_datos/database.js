import { openDB } from 'idb';

export const dbPromise = openDB('encuentraUES', 1, {
    upgrade(db) {

        if (!db.objectStoreNames.contains('usuarios')) {
            db.createObjectStore('usuarios', {
                keyPath: 'id',
                autoIncrement: true
            });
        }

        if (!db.objectStoreNames.contains('objetos')) {
            db.createObjectStore('objetos', {
                keyPath: 'id',
                autoIncrement: true
            });
        }
        

        if (!db.objectStoreNames.contains('reclamos')) {
            db.createObjectStore('reclamos', {
                keyPath: 'id',
                autoIncrement: true
            });
        }

        if (!db.objectStoreNames.contains('entregas')) {
            db.createObjectStore('entregas', {
                keyPath: 'id',
                autoIncrement: true
            });
        }

    }
});