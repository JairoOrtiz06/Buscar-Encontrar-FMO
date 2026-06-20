<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';

    let notificacion = "";
    let objetosPendientes: any[] = [];
    let objetoEditando: any = null;

    onMount(async () => {
        await cargarObjetos();
    });

    async function cargarObjetos() {
        const db = await dbPromise;

        const tx = db.transaction('objetos', 'readonly');
        const store = tx.objectStore('objetos');

        const todos = await store.getAll();

        const hoy = new Date();

        for (const objeto of todos) {

            if (!objeto.fechaPublicacion) continue;

            const fecha = new Date(objeto.fechaPublicacion);

            const dias =
                (hoy.getTime() - fecha.getTime()) /
                (1000 * 60 * 60 * 24);

            if (
                objeto.estado === "pendiente" &&
                dias >= 7
            ) {
                objeto.estado = "archivado";

                const txUpdate = db.transaction(
                    'objetos',
                    'readwrite'
                );

                await txUpdate
                    .objectStore('objetos')
                    .put(objeto);
            }
        }

        const actualizados = await store.getAll();

        objetosPendientes = actualizados.filter(
            o => o.estado === "pendiente"
        );
    }

    async function eliminarObjeto(id: number) {

        const confirmar = confirm(
            "¿Desea eliminar este objeto?"
        );

        if (!confirmar) return;

        const db = await dbPromise;

        const tx = db.transaction(
            'objetos',
            'readwrite'
        );

        const store = tx.objectStore('objetos');

        await store.delete(id);

        await cargarObjetos();

        mostrarNotificacion(
            "Objeto eliminado correctamente"
        );
    }

    function editarObjeto(objeto: any) {
        objetoEditando = { ...objeto };
    }

    async function guardarEdicion() {

        const db = await dbPromise;

        const tx = db.transaction(
            'objetos',
            'readwrite'
        );

        const store = tx.objectStore('objetos');

        await store.put(objetoEditando);

        await cargarObjetos();

        mostrarNotificacion(
            "Objeto editado correctamente"
        );

        objetoEditando = null;
    }

    function cancelarEdicion() {
        objetoEditando = null;
    }

    function mostrarNotificacion(
        mensaje: string
    ) {

        notificacion = mensaje;

        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }

    function formatearFecha(fecha: string) {

        if (!fecha) return "Sin fecha";

        return new Date(fecha)
            .toLocaleDateString();
    }
</script>

{#if notificacion} <div class="notificacion">
{notificacion} </div>
{/if}

<h2>Objetos Publicados</h2>

<div class="contenedor-cards">

{#if objetosPendientes.length > 0}

```
{#each objetosPendientes as objeto}

    <div class="card">

        <div class="contenido-card">

            <h3>{objeto.titulo}</h3>

            <p>
                <strong>Categoría:</strong>
                {objeto.categoria}
            </p>

            <p>
                <strong>Ubicación:</strong>
                {objeto.ubicacion}
            </p>

            <p>
                <strong>Fecha:</strong>
                {formatearFecha(
                    objeto.fechaPublicacion
                )}
            </p>

            <p>
                <strong>Estado:</strong>
                {objeto.estado}
            </p>

        </div>

        {#if objeto.foto}
            <img
                src={objeto.foto}
                alt={objeto.titulo}
                class="foto-carnet"
            >
        {/if}

        <div class="acciones">

            <button
                class="editar"
                on:click={() =>
                    editarObjeto(objeto)}
            >
                Editar
            </button>

            <button
                class="eliminar"
                on:click={() =>
                    eliminarObjeto(objeto.id)}
            >
                Eliminar
            </button>

        </div>

    </div>

{/each}
```

{:else}

```
<p>
    No hay objetos pendientes.
</p>
```

{/if}

</div>

{#if objetoEditando}

<div
    class="modal-overlay"
    on:click={cancelarEdicion}
>

```
<div
    class="modal-content"
    on:click|stopPropagation
>

    <h2>Editar Objeto</h2>

    <label>
        Título:

        <input
            bind:value={objetoEditando.titulo}
        >
    </label>

    <label>
        Categoría:

        <input
            bind:value={objetoEditando.categoria}
        >
    </label>

    <label>
        Ubicación:

        <input
            bind:value={objetoEditando.ubicacion}
        >
    </label>

    <div class="acciones">

        <button
            on:click={guardarEdicion}
        >
            Guardar
        </button>

        <button
            on:click={cancelarEdicion}
        >
            Cancelar
        </button>

    </div>

</div>
```

</div>

{/if}


<style>
    .notificacion {
        background: #4caf50;
        color: white;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        text-align: center;
        animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  .contenedor-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,.08);
    border-top: 5px solid #b30000;
    transition: .3s;
    width: 420px;
}

.card:hover {
    transform: translateY(-6px);
    box-shadow: 0 15px 35px rgba(0,0,0,.15);
}
.foto-carnet {
    width: 80%;
    height: 220px;
    object-fit: cover;
    border-radius: 1rem;
}
.contenido-card {
    padding: 1rem;
}

.contenido-card h3 {
    color: #b30000;
    margin-bottom: 1rem;
}

.contenido-card p {
    margin: .5rem 0;
    color: #475569;
}
.acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    padding: 1rem;
}
.aprobar {
    background: #16a34a;
    color: white;
}

.editar {
    background: #2563eb;
    color: white;
}

.rechazar {
    background: #dc2626;
    color: white;
}

.acciones button {
    flex: 1;
    min-width: 100px;

    border: none;
    border-radius: 10px;

    padding: 10px;

    cursor: pointer;

    transition: .3s;
}
.acciones button:hover {
    transform: translateY(-2px);
}
.modal-content {
    background: white;
    width: 90%;
    max-width: 500px;
    padding: 2rem;
    border-radius: 16px;
}
.modal-content label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
}
.modal-content input {
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    margin-top: 5px;
}
h2 {
    color: #b30000;
    margin: 2rem 0 1rem;
    text-align: center;
}
</style>
