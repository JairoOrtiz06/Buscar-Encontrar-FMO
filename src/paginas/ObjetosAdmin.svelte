<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';
    import { CATEGORIAS } from '../utilidades/constantes.js';

    let notificacion = "";
    let objetosPendientes: any[] = [];
    let objetoEditando: any = null;

    onMount(async () => {
        await archivarObjetosVencidos();

        await cargarObjetos();
    });

    async function cargarObjetos() {
        const db = await dbPromise;
        const tx = db.transaction('objetos', 'readonly');
        const store = tx.objectStore('objetos');
        const todos = await store.getAll();

        const actualizados = await store.getAll();
        objetosPendientes = actualizados.filter(o => o.estado === "pendiente");
    }

    async function eliminarObjeto(id: number) {
        const confirmar = confirm("¿Desea eliminar este objeto?");
        if (!confirmar) return;

        const db = await dbPromise;
        const tx = db.transaction('objetos', 'readwrite');
        const store = tx.objectStore('objetos');
        await store.delete(id);

        await cargarObjetos();
        mostrarNotificacion("Objeto eliminado correctamente");
    }

    function editarObjeto(objeto: any) {
        objetoEditando = { ...objeto };
    }

    async function guardarEdicion() {
        const db = await dbPromise;
        const tx = db.transaction('objetos', 'readwrite');
        const store = tx.objectStore('objetos');
        await store.put(objetoEditando);

        await cargarObjetos();
        mostrarNotificacion("Objeto editado correctamente");
        objetoEditando = null;
    }

    function cancelarEdicion() {
        objetoEditando = null;
    }

    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;
        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }
    async function archivarObjetosVencidos() {

        const db = await dbPromise;

        const tx = db.transaction('objetos', 'readwrite');
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

                await store.put(objeto);
            }
        }
    }

    function formatearFecha(fecha: string) {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString();
    }
    function diasRestantes(fechaPublicacion: string) {

        if (!fechaPublicacion) return 0;

        const fecha = new Date(fechaPublicacion);
        const hoy = new Date();

        const diasTranscurridos = Math.floor(
            (hoy.getTime() - fecha.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const restantes = 7 - diasTranscurridos;

        return restantes > 0 ? restantes : 0;
    }
    function fechaArchivo(fechaPublicacion: string) {

        const fecha = new Date(fechaPublicacion);

        fecha.setDate(fecha.getDate() + 7);

        return fecha.toLocaleDateString();
    }
</script>
<div class="container">
{#if notificacion}
    <div class="alert alert-success text-center" role="alert">
        {notificacion}
    </div>
{/if}

<h2 class="mb-4">Objetos Publicados</h2>

<div class="row g-4">
    {#if objetosPendientes.length > 0}
        {#each objetosPendientes as objeto}
            <div class="col-md-6 col-lg-4">
                <div class="card shadow h-100">
                    {#if objeto.foto}
                        <img src={objeto.foto} alt={objeto.titulo} class="card-img-top">
                    {/if}
                    <div class="card-body">
                        <h5 class="card-title text-danger">{objeto.titulo}</h5>
                        <p class="card-text"><strong>Categoría:</strong> {objeto.categoria}</p>
                        <p class="card-text"><strong>Ubicación:</strong> {objeto.ubicacion}</p>
                        <p class="card-text"><strong>Fecha:</strong> {formatearFecha(objeto.fechaPublicacion)}</p>
                        <p class="card-text"><strong>Estado:</strong> {objeto.estado}</p>
                        {#if objeto.estado === "pendiente"}

                            {#if diasRestantes(objeto.fechaPublicacion) <= 2}

                                <span class="badge bg-danger">
                                    Quedan {diasRestantes(objeto.fechaPublicacion)} días
                                </span>

                            {:else if diasRestantes(objeto.fechaPublicacion) <= 4}

                                <span class="badge bg-warning text-dark">
                                    Quedan {diasRestantes(objeto.fechaPublicacion)} días
                                </span>

                            {:else}

                                <span class="badge bg-success">
                                    Quedan {diasRestantes(objeto.fechaPublicacion)} días
                                </span>

                            {/if}

                            {/if}
                                <p class="card-text">
                                <strong>Se archivará:</strong>
                                {fechaArchivo(objeto.fechaPublicacion)}
                            </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary btn-sm" on:click={() => editarObjeto(objeto)}>Editar</button>
                        <button class="btn btn-danger btn-sm" on:click={() => eliminarObjeto(objeto.id)}>Eliminar</button>
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <p class="text-muted">No hay objetos pendientes.</p>
    {/if}
</div>

{#if objetoEditando}
    <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,.5);" on:click={cancelarEdicion}>
        <div class="modal-dialog" on:click|stopPropagation>
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Objeto</h5>
                    <button type="button" class="btn-close" on:click={cancelarEdicion}></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Título</label>
                        <input class="form-control" bind:value={objetoEditando.titulo}>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Categoría</label>

                        <select
                            class="form-select"
                            bind:value={objetoEditando.categoria}
                        >
                            <option value="">
                                Seleccione una categoría
                            </option>

                            {#each CATEGORIAS as categoria}
                                <option value={categoria}>
                                    {categoria}
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            Descripción
                        </label>

                        <textarea
                            class="form-control"
                            rows="3"
                            bind:value={objetoEditando.descripcion}
                        ></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ubicación</label>
                        <input class="form-control" bind:value={objetoEditando.ubicacion}>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" on:click={guardarEdicion}>Guardar</button>
                    <button class="btn btn-secondary" on:click={cancelarEdicion}>Cancelar</button>
                </div>
            </div>
        </div>
    </div>
{/if}
</div>
<footer class=" bg-danger text-white text-center p-3 rounded mt-4">

    <p class="mb-1">
        © 2026 Encuentra UES-FMO
    </p>

    <p class="mb-1">
        Sistema de Gestión de Objetos Perdidos y Encontrados
    </p>

    <p class="mb-0">
        Universidad de El Salvador - Facultad Multidisciplinaria Oriental
    </p>

</footer>

