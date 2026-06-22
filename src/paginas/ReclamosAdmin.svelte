<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';

    let notificacion = "";
    let reclamosPendientes: any[] = [];
    let reclamosAprobados: any[] = [];
    let reclamosRechazados: any[] = [];
    let reclamosEntregados: any[] = [];
    let usuarios: any[] = [];
    let objetos: any[] = [];

    onMount(async () => {
        await cargarReclamos();
    });

    async function cargarReclamos() {
    const db = await dbPromise;

    const reclamosTx = db.transaction('reclamos', 'readonly');
    const reclamosStore = reclamosTx.objectStore('reclamos');
    const todos = await reclamosStore.getAll();

    const usuariosTx = db.transaction('usuarios', 'readonly');
    const usuariosStore = usuariosTx.objectStore('usuarios');
    usuarios = await usuariosStore.getAll();

    const objetosTx = db.transaction('objetos', 'readonly');
    const objetosStore = objetosTx.objectStore('objetos');
    objetos = await objetosStore.getAll();

    reclamosPendientes = todos.filter(r => r.estado === "pendiente");
    reclamosAprobados = todos.filter(r => r.estado === "aprobado");
    reclamosRechazados = todos.filter(r => r.estado === "rechazado");
    reclamosEntregados = todos.filter(r => r.estado === "entregado");
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

    async function entregarReclamo(id: number) {

        const db = await dbPromise;

        const tx = db.transaction(
            ['reclamos', 'objetos','entregas'],
            'readwrite'
        );

        const reclamosStore = tx.objectStore('reclamos');
        const objetosStore = tx.objectStore('objetos');
        const entregasStore = tx.objectStore('entregas');

        const reclamo = await reclamosStore.get(id);

        if (!reclamo) return;

        reclamo.estado = "entregado";

        await reclamosStore.put(reclamo);

        const objeto = await objetosStore.get(reclamo.idObjeto);

        if (objeto) {

            objeto.estado = "entregado";

            await objetosStore.put(objeto);
        }
        
        await entregasStore.add({
            idObjeto: reclamo.idObjeto,
            idReclamo: reclamo.id,
            fechaEntrega: new Date().toISOString()
        });

        await tx.done;

        await cargarReclamos();

        mostrarNotificacion("Objeto entregado correctamente");
    }
    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;
        setTimeout(() => { notificacion = ""; }, 3000);
    }

    function formatearFecha(fecha: string) {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString();
    }
    function obtenerUsuario(id: string | number) {
        return usuarios.find(
            u => String(u.id) === String(id)
        );
    }

    function obtenerObjeto(id: string | number) {
        return objetos.find(
            o => String(o.id) === String(id)
        );
    }
</script>

{#if notificacion}
    <div class="alert alert-info text-center shadow position-fixed top-0 end-0 m-3">
        {notificacion}
    </div>
{/if}

<h2 class="text-center text-danger my-4">Reclamos Pendientes</h2>

<div class="row g-4">
    {#if reclamosPendientes.length > 0}
        {#each reclamosPendientes as reclamo}

    {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
    {@const objeto = obtenerObjeto(reclamo.idObjeto)}

    <div class="col-md-8 col-lg-5 col-xl-4">
        <div class="card shadow border-0 h-100">

            {#if objeto?.foto}
                <img
                    src={objeto.foto}
                    alt={objeto.titulo}
                    class="card-img-top"
                    style="height: 260px; object-fit: cover;"
                />
            {/if}

            <div class="card-body">

                <h4 class="card-title text-danger fw-bold">
                    {objeto?.titulo || 'Objeto'}
                </h4>

                <hr>

                <h5 class="text-primary">
                    Solicitante
                </h5>

                <p class="mb-1">
                    <strong>Nombre:</strong>
                    {usuario?.nombre || 'No disponible'}
                </p>

                <p class="mb-1">
                    <strong>Carnet:</strong>
                    {usuario?.carnet || 'No disponible'}
                </p>

                <p class="mb-1">
                    <strong>Correo:</strong>
                    {usuario?.correo || 'No disponible'}
                </p>

                <p class="mb-3">
                    <strong>Teléfono:</strong>
                    {usuario?.telefono || reclamo.contacto}
                </p>

                <h5 class="text-success">
                    Información del objeto
                </h5>

                <p class="mb-1">
                    <strong>Categoría:</strong>
                    {objeto?.categoria}
                </p>

                <p class="mb-1">
                    <strong>Ubicación:</strong>
                    {objeto?.ubicacion}
                </p>

                <p class="mb-3">
                    <strong>Fecha:</strong>
                    {formatearFecha(reclamo.fechaSolicitud)}
                </p>

                <h5 class="text-warning">
                    Motivo del reclamo
                </h5>

                <div class="alert alert-light border">
                    {reclamo.motivo}
                </div>

                <h5 class="text-secondary">
                    Descripción proporcionada
                </h5>

                <div class="alert alert-secondary">
                    {reclamo.descripcion}
                </div>

                <div class="d-flex gap-2">

                    <button
                        class="btn btn-success"
                        on:click={() => aprobarReclamo(reclamo.id)}
                    >
                        Aprobar
                    </button>

                    <button
                        class="btn btn-danger"
                        on:click={() => rechazarReclamo(reclamo.id)}
                    >
                        Rechazar
                    </button>

                </div>

            </div>
        </div>
    </div>

{/each}
    {:else}
        <p class="text-muted text-center">No hay reclamos pendientes.</p>
    {/if}
</div>

<h2 class="text-center text-success my-4">Reclamos Aprobados</h2>
<div class="row g-4">
    {#each reclamosAprobados as reclamo}
        {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
        {@const objeto = obtenerObjeto(reclamo.idObjeto)}
        <div class="col-md-4">
            <div class="card border-success shadow h-100">
                <div class="card-body">

                    <div class="card border-success shadow h-100">

                        {#if objeto?.foto}
                            <img
                                src={objeto.foto}
                                alt={objeto.titulo}
                                class="card-img-top"
                                style="height:220px; object-fit:cover;"
                            />
                        {/if}

                        <div class="card-body">

                            <h5 class="fw-bold text-success">
                                {objeto?.titulo}
                            </h5>

                            <p class="mb-1">
                                {usuario?.nombre}
                            </p>

                            <p class="mb-3 text-muted">
                                {usuario?.correo}
                            </p>

                            <div class="alert alert-success">
                                ✓ Reclamo aprobado
                            </div>

                            <button
                                class="btn btn-primary w-100"
                                on:click={() => entregarReclamo(reclamo.id)}
                            >
                                📦 Marcar como entregado
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

<h2 class="text-center text-danger my-4">Reclamos Rechazados</h2>
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

<h2 class="text-center text-secondary my-4">
    Objetos Entregados
</h2>

<div class="row g-4">

    {#each reclamosEntregados as reclamo}

        {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
        {@const objeto = obtenerObjeto(reclamo.idObjeto)}

        <div class="col-md-4">

            <div class="card border-secondary shadow h-100">

                {#if objeto?.foto}
                    <img
                        src={objeto.foto}
                        alt={objeto.titulo}
                        class="card-img-top"
                        style="height:220px; object-fit:cover;"
                    />
                {/if}

                <div class="card-body">

                    <h5 class="fw-bold">
                        📦 {objeto?.titulo}
                    </h5>

                    <p>
                        👤 {usuario?.nombre}
                    </p>

                    <span class="badge bg-secondary">
                        ✓ Entregado
                    </span>

                </div>

            </div>

        </div>

    {/each}

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
