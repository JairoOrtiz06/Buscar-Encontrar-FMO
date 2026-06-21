<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';

    let notificacion = "";
    let reclamosPendientes: any[] = [];
    let reclamosAprobados: any[] = [];
    let reclamosRechazados: any[] = [];

    onMount(async () => {
        await cargarReclamos();
    });

    async function cargarReclamos() {
        const db = await dbPromise;
        const tx = db.transaction('reclamos', 'readonly');
        const store = tx.objectStore('reclamos');
        const todos = await store.getAll();

        reclamosPendientes = todos.filter(r => r.estado === "pendiente");
        reclamosAprobados = todos.filter(r => r.estado === "aprobado");
        reclamosRechazados = todos.filter(r => r.estado === "rechazado");
    }

    async function aprobarReclamo(id: number) {
        const db = await dbPromise;
        const tx = db.transaction('reclamos', 'readwrite');
        const store = tx.objectStore('reclamos');
        const reclamo = await store.get(id);
        if (!reclamo) return;

        reclamo.estado = "aprobado";
        await store.put(reclamo);
        await cargarReclamos();
        mostrarNotificacion("Reclamo aprobado");
    }

    async function rechazarReclamo(id: number) {
        const db = await dbPromise;
        const tx = db.transaction('reclamos', 'readwrite');
        const store = tx.objectStore('reclamos');
        const reclamo = await store.get(id);
        if (!reclamo) return;

        reclamo.estado = "rechazado";
        await store.put(reclamo);
        await cargarReclamos();
        mostrarNotificacion("Reclamo rechazado");
    }

    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;
        setTimeout(() => { notificacion = ""; }, 3000);
    }

    function formatearFecha(fecha: string) {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString();
    }
</script>

{#if notificacion}
    <div class="alert alert-info text-center shadow position-fixed top-0 end-0 m-3">
        {notificacion}
    </div>
{/if}

<h2 class="text-center text-danger my-4">📋 Reclamos Pendientes</h2>

<div class="row g-4">
    {#if reclamosPendientes.length > 0}
        {#each reclamosPendientes as reclamo}
            <div class="col-md-4">
                <div class="card shadow h-100">
                    <div class="card-body">
                        <h5 class="card-title">Reclamo #{reclamo.id}</h5>
                        <p><strong>ID Objeto:</strong> {reclamo.idObjeto}</p>
                        <p><strong>ID Solicitante:</strong> {reclamo.idSolicitante}</p>
                        <p><strong>Estado:</strong> {reclamo.estado}</p>
                        <p><strong>Fecha:</strong> {formatearFecha(reclamo.fechaSolicitud)}</p>
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-success btn-sm" on:click={() => aprobarReclamo(reclamo.id)}>Aprobar</button>
                            <button class="btn btn-danger btn-sm" on:click={() => rechazarReclamo(reclamo.id)}>Rechazar</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <p class="text-muted text-center">No hay reclamos pendientes.</p>
    {/if}
</div>

<h2 class="text-center text-success my-4">✅ Reclamos Aprobados</h2>
<div class="row g-4">
    {#each reclamosAprobados as reclamo}
        <div class="col-md-4">
            <div class="card border-success shadow h-100">
                <div class="card-body">
                    <h5 class="card-title">Reclamo #{reclamo.id}</h5>
                    <p>ID Objeto: {reclamo.idObjeto}</p>
                    <p>ID Solicitante: {reclamo.idSolicitante}</p>
                    <span class="badge bg-success">✓ Aprobado</span>
                </div>
            </div>
        </div>
    {/each}
</div>

<h2 class="text-center text-danger my-4">❌ Reclamos Rechazados</h2>
<div class="row g-4">
    {#each reclamosRechazados as reclamo}
        <div class="col-md-4">
            <div class="card border-danger shadow h-100">
                <div class="card-body">
                    <h5 class="card-title">Reclamo #{reclamo.id}</h5>
                    <p>ID Objeto: {reclamo.idObjeto}</p>
                    <p>ID Solicitante: {reclamo.idSolicitante}</p>
                    <span class="badge bg-danger">✕ Rechazado</span>
                </div>
            </div>
        </div>
    {/each}
</div>
