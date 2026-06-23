<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';
    import {
        enviarNotificacion,
        enviarNotificacionAdmins
    } from '../servicios/notificacionesService.js';

    let notificacion = "";
    let reclamosPendientes: any[] = [];
    let reclamosAprobados: any[] = [];
    let reclamosRechazados: any[] = [];
    let reclamosEntregados: any[] = [];
    let usuarios: any[] = [];
    let objetos: any[] = [];
    let imagenSeleccionada = "";

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
        const tx = db.transaction(['reclamos', 'objetos'], 'readwrite');
        const reclamosStore = tx.objectStore('reclamos');
        const objetosStore = tx.objectStore('objetos');
        const reclamo = await reclamosStore.get(id);
        if (!reclamo) return;

        reclamo.estado = "aprobado";
        await reclamosStore.put(reclamo);

        const objeto = await objetosStore.get(reclamo.idObjeto);
        if (objeto) {
            objeto.estado = "reclamado";
            await objetosStore.put(objeto);
        }

        await tx.done;

        await enviarNotificacion({
            idUsuario: reclamo.idSolicitante,
            titulo: 'Reclamo aprobado',
            mensaje: `Tu reclamo del objeto "${objeto?.titulo || 'Objeto'}" fue aprobado.`,
            tipo: 'reclamo-aprobado',
            referencia: {
                idReclamo: reclamo.id,
                idObjeto: reclamo.idObjeto
            }
        });

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
            ['reclamos', 'objetos', 'entregas'],
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

        const tituloObjeto = objeto?.titulo || 'Objeto';

        await Promise.all([
            enviarNotificacion({
                idUsuario: reclamo.idSolicitante,
                titulo: 'Objeto entregado',
                mensaje: `El objeto "${tituloObjeto}" fue marcado como entregado.`,
                tipo: 'objeto-entregado',
                referencia: {
                    idReclamo: reclamo.id,
                    idObjeto: reclamo.idObjeto
                }
            }),
            objeto?.idUsuario != null
                ? enviarNotificacion({
                    idUsuario: objeto.idUsuario,
                    titulo: 'Objeto entregado',
                    mensaje: `Tu publicacion "${tituloObjeto}" fue marcada como entregada.`,
                    tipo: 'objeto-entregado',
                    referencia: {
                        idReclamo: reclamo.id,
                        idObjeto: reclamo.idObjeto
                    }
                })
                : Promise.resolve(),
            enviarNotificacionAdmins({
                titulo: 'Objeto entregado',
                mensaje: `El objeto "${tituloObjeto}" fue marcado como entregado.`,
                tipo: 'objeto-entregado',
                referencia: {
                    idReclamo: reclamo.id,
                    idObjeto: reclamo.idObjeto
                }
            })
        ]);

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
    <div class="alert alert-info text-center shadow position-fixed top-0 end-0 m-3" style="z-index: 1050;">
        {notificacion}
    </div>
{/if}

{#if imagenSeleccionada}
    <div
        class="modal d-block"
        tabindex="-1"
        role="button"
        aria-label="Cerrar imagen ampliada"
        style="background: rgba(0,0,0,.8);"
        on:keydown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter') {
                imagenSeleccionada = "";
            }
        }}
        on:click={() => imagenSeleccionada = ""}>
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content border-0 bg-transparent shadow-none">
                <img
                    src={imagenSeleccionada}
                    alt="Imagen ampliada"
                    class="img-fluid rounded">
            </div>
        </div>
    </div>
{/if}

<div class="container flex-grow-1 pb-4">
    <h2 class="text-center text-ues-red fw-bold my-4">
        Reclamos Pendientes
        <span class="badge bg-ues-red ms-2">{reclamosPendientes.length}</span>
    </h2>

    <div class="row g-4">
        {#each reclamosPendientes as reclamo}
            {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
            {@const objeto = obtenerObjeto(reclamo.idObjeto)}

            <div class="col-12 col-lg-6 col-xl-4">
                <div class="card shadow-sm border-0 rounded-3 h-100 overflow-hidden">
                    {#if objeto?.foto}
                        <button
                            type="button"
                            class="border-0 bg-transparent p-0 w-100"
                            on:click={() => imagenSeleccionada = objeto.foto}>
                            <img
                                src={objeto.foto}
                                alt={objeto.titulo}
                                class="card-img-top"
                                style="height: 220px; object-fit: cover; cursor: pointer;"
                            />
                        </button>
                    {/if}

                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h4 class="card-title text-ues-red fw-bold mb-0">
                                {objeto?.titulo || 'Objeto'}
                            </h4>
                            <span class="badge bg-warning text-dark">
                                Pendiente
                            </span>
                        </div>

                        <hr>

                        <h5 class="text-ues-red fw-bold">Solicitante</h5>
                        <p class="mb-1"><strong>Nombre:</strong> {usuario?.nombre || 'No disponible'}</p>
                        <p class="mb-1">
                            <strong>{usuario?.tipo === 'estudiante' ? 'Carnet' : 'Codigo Institucional'}:</strong>
                            {usuario?.carnet || usuario?.codigoInstitucional || 'No disponible'}
                        </p>
                        <p class="mb-1"><strong>Correo:</strong> {usuario?.correo || 'No disponible'}</p>
                        <p class="mb-3"><strong>Telefono:</strong> {usuario?.telefono || reclamo.contacto}</p>

                        <h5 class="text-ues-red fw-bold">Informacion del objeto</h5>
                        <p class="mb-1"><strong>Categoria:</strong> {objeto?.categoria || 'No disponible'}</p>
                        <p class="mb-1"><strong>Ubicacion:</strong> {objeto?.ubicacion || 'No disponible'}</p>
                        <p class="mb-3"><strong>Fecha:</strong> {formatearFecha(reclamo.fechaSolicitud)}</p>

                        <h5 class="fw-bold">Motivo del reclamo</h5>
                        <div class="alert alert-light border mb-3">
                            {reclamo.motivo}
                        </div>

                        <h5 class="fw-bold text-muted">Descripcion proporcionada</h5>
                        <div class="alert alert-secondary flex-grow-1">
                            {reclamo.descripcion}
                        </div>

                        <div class="d-grid gap-2 d-sm-flex">
                            <button
                                class="btn btn-success fw-semibold flex-fill shadow-sm"
                                on:click={() => aprobarReclamo(reclamo.id)}
                            >
                                Aprobar
                            </button>

                            <button
                                class="btn btn-outline-danger fw-semibold flex-fill"
                                on:click={() => rechazarReclamo(reclamo.id)}
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="col-12">
                <div class="alert alert-light border text-center shadow-sm py-4 mb-0">
                    <h5 class="text-ues-red fw-bold mb-2">No hay reclamos pendientes</h5>
                    <p class="text-muted mb-0">
                        Cuando un usuario envie un reclamo nuevo, aparecera aqui para aprobarlo o rechazarlo.
                    </p>
                </div>
            </div>
        {/each}
    </div>

    <h2 class="text-center text-success fw-bold my-4">
        Reclamos Aprobados
        <span class="badge bg-success ms-2">{reclamosAprobados.length}</span>
    </h2>

    <div class="row g-4">
        {#each reclamosAprobados as reclamo}
            {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
            {@const objeto = obtenerObjeto(reclamo.idObjeto)}

            <div class="col-12 col-md-6 col-xl-4">
                <div class="card border-success shadow-sm rounded-3 h-100 overflow-hidden">
                    {#if objeto?.foto}
                        <img src={objeto.foto} alt={objeto.titulo} class="card-img-top" style="height:200px; object-fit:cover;" />
                    {/if}

                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h5 class="fw-bold text-success mb-0">{objeto?.titulo || 'Objeto'}</h5>
                            <span class="badge bg-success">Aprobado</span>
                        </div>

                        <p class="mb-1"><strong>Solicitante:</strong> {usuario?.nombre || 'No disponible'}</p>
                        <p class="mb-1 text-muted">{usuario?.correo || 'Correo no disponible'}</p>
                        <p class="mb-3"><strong>Fecha:</strong> {formatearFecha(reclamo.fechaSolicitud)}</p>

                        <div class="alert alert-success py-2 mt-auto">
                            Listo para marcar como entregado.
                        </div>

                        <button
                            class="btn btn-primary fw-semibold w-100 shadow-sm"
                            on:click={() => entregarReclamo(reclamo.id)}
                        >
                            Marcar como entregado
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="col-12">
                <div class="alert alert-light border text-center shadow-sm py-4 mb-0">
                    <h5 class="text-success fw-bold mb-2">No hay reclamos aprobados</h5>
                    <p class="text-muted mb-0">
                        Los reclamos aprobados apareceran aqui antes de marcar el objeto como entregado.
                    </p>
                </div>
            </div>
        {/each}
    </div>

    <h2 class="text-center text-ues-red fw-bold my-4">
        Reclamos Rechazados
        <span class="badge bg-danger ms-2">{reclamosRechazados.length}</span>
    </h2>

    <div class="row g-4">
        {#each reclamosRechazados as reclamo}
            {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
            {@const objeto = obtenerObjeto(reclamo.idObjeto)}

            <div class="col-12 col-md-6 col-xl-4">
                <div class="card border-danger shadow-sm rounded-3 h-100 overflow-hidden">
                    {#if objeto?.foto}
                        <img src={objeto.foto} alt={objeto.titulo} class="card-img-top" style="height:200px; object-fit:cover;" />
                    {/if}

                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h5 class="card-title fw-bold mb-0">{objeto?.titulo || 'Objeto'}</h5>
                            <span class="badge bg-danger">Rechazado</span>
                        </div>

                        <p class="mb-1"><strong>Solicitante:</strong> {usuario?.nombre || 'No disponible'}</p>
                        <p class="mb-1"><strong>Correo:</strong> {usuario?.correo || 'No disponible'}</p>
                        <p class="mb-0">
                            <strong>{usuario?.tipo === 'estudiante' ? 'Carnet' : 'Codigo Institucional'}:</strong>
                            {usuario?.carnet || usuario?.codigoInstitucional || 'No disponible'}
                        </p>
                    </div>
                </div>
            </div>
        {:else}
            <div class="col-12">
                <div class="alert alert-light border text-center shadow-sm py-4 mb-0">
                    <h5 class="text-ues-red fw-bold mb-2">No hay reclamos rechazados</h5>
                    <p class="text-muted mb-0">
                        Los reclamos rechazados apareceran aqui cuando se deniegue una solicitud.
                    </p>
                </div>
            </div>
        {/each}
    </div>

    <h2 class="text-center text-secondary fw-bold my-4">
        Objetos Entregados
        <span class="badge bg-secondary ms-2">{reclamosEntregados.length}</span>
    </h2>

    <div class="row g-4">
        {#each reclamosEntregados as reclamo}
            {@const usuario = obtenerUsuario(reclamo.idSolicitante)}
            {@const objeto = obtenerObjeto(reclamo.idObjeto)}

            <div class="col-12 col-md-6 col-xl-4">
                <div class="card border-secondary shadow-sm rounded-3 h-100 overflow-hidden">
                    {#if objeto?.foto}
                        <img src={objeto.foto} alt={objeto.titulo} class="card-img-top" style="height:200px; object-fit:cover;" />
                    {/if}

                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h5 class="fw-bold mb-0">{objeto?.titulo || 'Objeto'}</h5>
                            <span class="badge bg-secondary">Entregado</span>
                        </div>

                        <p class="mb-1"><strong>Recibido por:</strong> {usuario?.nombre || 'No disponible'}</p>
                        <p class="mb-0 text-muted">{usuario?.correo || 'Correo no disponible'}</p>
                    </div>
                </div>
            </div>
        {:else}
            <div class="col-12">
                <div class="alert alert-light border text-center shadow-sm py-4 mb-0">
                    <h5 class="text-secondary fw-bold mb-2">No hay objetos entregados</h5>
                    <p class="text-muted mb-0">
                        Cuando un reclamo aprobado se marque como entregado, aparecera en esta seccion.
                    </p>
                </div>
            </div>
        {/each}
    </div>
</div>

<footer class="bg-ues-red text-white text-center p-3 mt-auto">
    <p class="mb-1">
        © 2026 Encuentra UES-FMO
    </p>

    <p class="mb-1">
        Sistema de Gestion de Objetos Perdidos y Encontrados
    </p>

    <p class="mb-0">
        Universidad de El Salvador - Facultad Multidisciplinaria Oriental
    </p>
</footer>

<style>
    .bg-ues-red {
        background-color: #990c14;
    }

    .text-ues-red {
        color: #990c14;
    }
</style>
