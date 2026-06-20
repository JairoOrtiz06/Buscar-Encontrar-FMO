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

        const tx = db.transaction(
            'reclamos',
            'readonly'
        );

        const store =
            tx.objectStore('reclamos');

        const todos =
            await store.getAll();

        reclamosPendientes =
            todos.filter(
                r => r.estado === "pendiente"
            );

        reclamosAprobados =
            todos.filter(
                r => r.estado === "aprobado"
            );

        reclamosRechazados =
            todos.filter(
                r => r.estado === "rechazado"
            );
    }

    async function aprobarReclamo(
        id: number
    ) {

        const db = await dbPromise;

        const tx = db.transaction(
            'reclamos',
            'readwrite'
        );

        const store =
            tx.objectStore('reclamos');

        const reclamo =
            await store.get(id);

        if (!reclamo) return;

        reclamo.estado =
            "aprobado";

        await store.put(reclamo);

        await cargarReclamos();

        mostrarNotificacion(
            "Reclamo aprobado"
        );
    }

    async function rechazarReclamo(
        id: number
    ) {

        const db = await dbPromise;

        const tx = db.transaction(
            'reclamos',
            'readwrite'
        );

        const store =
            tx.objectStore('reclamos');

        const reclamo =
            await store.get(id);

        if (!reclamo) return;

        reclamo.estado =
            "rechazado";

        await store.put(reclamo);

        await cargarReclamos();

        mostrarNotificacion(
            "Reclamo rechazado"
        );
    }

    function mostrarNotificacion(
        mensaje: string
    ) {

        notificacion = mensaje;

        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }

    function formatearFecha(
        fecha: string
    ) {

        if (!fecha)
            return "Sin fecha";

        return new Date(
            fecha
        ).toLocaleDateString();
    }
</script>

{#if notificacion}
    <div class="notificacion">
        {notificacion}
    </div>
{/if}

<h2>📋 Reclamos Pendientes</h2>

<div class="contenedor-cards">

{#if reclamosPendientes.length > 0}

    {#each reclamosPendientes as reclamo}

        <div class="card">

            <h3>
                Reclamo #{reclamo.id}
            </h3>

            <p>
                <strong>ID Objeto:</strong>
                {reclamo.idObjeto}
            </p>

            <p>
                <strong>ID Solicitante:</strong>
                {reclamo.idSolicitante}
            </p>

            <p>
                <strong>Estado:</strong>
                {reclamo.estado}
            </p>

            <p>
                <strong>Fecha:</strong>
                {formatearFecha(
                    reclamo.fechaSolicitud
                )}
            </p>

            <div class="acciones">

                <button
                    class="aprobar"
                    on:click={() =>
                        aprobarReclamo(
                            reclamo.id
                        )}
                >
                    Aprobar
                </button>

                <button
                    class="rechazar"
                    on:click={() =>
                        rechazarReclamo(
                            reclamo.id
                        )}
                >
                    Rechazar
                </button>

            </div>

        </div>

    {/each}

{:else}

    <p>
        No hay reclamos pendientes.
    </p>

{/if}

</div>

<h2>✅ Reclamos Aprobados</h2>

<div class="contenedor-cards">

{#each reclamosAprobados as reclamo}

    <div class="card card-aprobada">

        <h3>
            Reclamo #{reclamo.id}
        </h3>

        <p>
            ID Objeto:
            {reclamo.idObjeto}
        </p>

        <p>
            ID Solicitante:
            {reclamo.idSolicitante}
        </p>

        <span
            class="estado-aprobado"
        >
            ✓ Aprobado
        </span>

    </div>

{/each}

</div>

<h2>❌ Reclamos Rechazados</h2>

<div class="contenedor-cards">

{#each reclamosRechazados as reclamo}

    <div class="card card-rechazada">

        <h3>
            Reclamo #{reclamo.id}
        </h3>

        <p>
            ID Objeto:
            {reclamo.idObjeto}
        </p>

        <p>
            ID Solicitante:
            {reclamo.idSolicitante}
        </p>

        <span
            class="estado-rechazado"
        >
            ✕ Rechazado
        </span>

    </div>

{/each}

</div>
<style>
    .contenedor-cards {
    display: grid;
    grid-template-columns:
        repeat(auto-fit,
        minmax(280px, 1fr));

    gap: 1.5rem;

    margin-bottom: 2rem;
}

.card {
    background: white;
    border-radius: 18px;
    padding: 1.5rem;
    border-left: 6px solid #b30000;
    box-shadow:
        0 8px 20px rgba(0,0,0,.08);

    transition: .3s;
}
.card:hover {
    transform: translateY(-5px);
    box-shadow:
        0 15px 35px rgba(0,0,0,.15);
}
h2 {
    color: #b30000;
    text-align: center;
    margin: 2rem 0 1rem;
}
h3 {
    color: #991b1b;
    margin-bottom: 1rem;
}
.card p {
    margin: .6rem 0;
    color: #475569;
}
.card p:nth-of-type(3) {
    background: #f8fafc;
    padding: 10px;
    border-radius: 10px;
    border-left: 4px solid #b30000;
}
.acciones {
    display: flex;
    gap: 10px;
    margin-top: 1rem;
}
.acciones button {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    font-weight: 600;
    transition: .3s;
}
.aprobar {
    background: #16a34a;
    color: white;
}

.aprobar:hover {
    background: #15803d;
}
.rechazar {
    background: #dc2626;
    color: white;
}

.rechazar:hover {
    background: #b91c1c;
}
.card-aprobada {
    border-left: 6px solid #16a34a;
}
.estado-aprobado {
    display: inline-block;
    margin-top: 10px;
    background: #dcfce7;
    color: #15803d;
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: bold;
}
</style>