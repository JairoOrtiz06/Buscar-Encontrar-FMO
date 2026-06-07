<script>
    import Login from './paginas/Login.svelte';

    import { dbPromise } from './base_datos/database.js';

    async function probarBD() {
        const db = await dbPromise;
        console.log("Base de datos creada:", db);
    }

    probarBD();
</script>


<Login />