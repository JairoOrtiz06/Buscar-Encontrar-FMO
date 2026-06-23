<script>
    import { onMount, onDestroy } from 'svelte';
    import { usuarioActual } from '../stores/authStore.js';
    import {
        obtenerNotificaciones,
        marcarNotificacionLeida,
        marcarTodasLeidas
    } from '../servicios/notificacionesService.js';

    export let modo = 'usuario';

    let abierto = false;
    let notificaciones = [];
    let intervalo = null;

    $: idUsuario = $usuarioActual?.id;
    $: noLeidas = notificaciones.filter(notificacion => !notificacion.leida).length;
    $: etiqueta = modo === 'admin' ? 'Notificaciones' : '🔔';

    onMount(async () => {
        await cargarNotificaciones();
        intervalo = setInterval(cargarNotificaciones, 5000);
    });

    onDestroy(() => {
        if (intervalo) clearInterval(intervalo);
    });

    async function cargarNotificaciones() {
        if (!idUsuario) {
            notificaciones = [];
            return;
        }

        notificaciones = await obtenerNotificaciones(idUsuario);
    }

    async function marcarLeida(notificacion) {
        await marcarNotificacionLeida(notificacion.id);
        await cargarNotificaciones();
    }

    async function marcarTodas() {
        await marcarTodasLeidas(idUsuario);
        await cargarNotificaciones();
    }

    function formatearFecha(fecha) {
        if (!fecha) return '';
        return new Date(fecha).toLocaleString();
    }
</script>

<div class="notificaciones position-relative">
    <button
        type="button"
        class="btn-notificaciones"
        class:admin={modo === 'admin'}
        on:click={() => abierto = !abierto}
        aria-label="Ver notificaciones"
    >
        <span>{etiqueta}</span>
        {#if noLeidas > 0}
            <span class="contador">{noLeidas}</span>
        {/if}
    </button>

    {#if abierto}
        <section class="panel-notificaciones shadow-lg">
            <div class="d-flex justify-content-between align-items-center border-bottom p-3">
                <div>
                    <h3 class="h6 fw-bold mb-0">Notificaciones</h3>
                    <small class="text-muted">{noLeidas} sin leer</small>
                </div>

                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    on:click={marcarTodas}
                    disabled={noLeidas === 0}
                >
                    Marcar todas
                </button>
            </div>

            <div class="lista-notificaciones">
                {#each notificaciones as notificacion}
                    <article class="notificacion-item" class:no-leida={!notificacion.leida}>
                        <div class="d-flex justify-content-between gap-2">
                            <h4 class="h6 fw-bold mb-1">{notificacion.titulo}</h4>
                            {#if !notificacion.leida}
                                <span class="badge bg-ues-red">Nueva</span>
                            {/if}
                        </div>

                        <p class="mb-2 text-secondary">{notificacion.mensaje}</p>
                        <small class="text-muted">{formatearFecha(notificacion.fechaCreacion)}</small>

                        {#if !notificacion.leida}
                            <button
                                type="button"
                                class="btn btn-sm btn-link text-ues-red fw-semibold p-0 mt-2 d-block"
                                on:click={() => marcarLeida(notificacion)}
                            >
                                Marcar como leida
                            </button>
                        {/if}
                    </article>
                {:else}
                    <div class="text-center p-4 text-muted">
                        No tienes notificaciones.
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .notificaciones {
        display: inline-flex;
        align-items: center;
    }

    .btn-notificaciones {
        min-height: 2.35rem;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
        font-weight: 800;
        border-radius: 10px;
        padding: 0.52rem 0.78rem;
        cursor: pointer;
        line-height: 1.1;
        font-size: 0.85rem;
        white-space: nowrap;
        position: relative;
    }

    .btn-notificaciones.admin {
        border-radius: 0.375rem;
        background: transparent;
        border-color: #fff;
        padding: 0.25rem 0.5rem;
        min-height: 1.95rem;
    }

    .btn-notificaciones:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .contador {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25rem;
        height: 1.25rem;
        margin-left: 0.35rem;
        border-radius: 999px;
        background: #fff;
        color: #990c14;
        font-size: 0.72rem;
        font-weight: 900;
    }

    .panel-notificaciones {
        position: absolute;
        top: calc(100% + 0.55rem);
        right: 0;
        width: min(360px, 92vw);
        max-height: 430px;
        background: #fff;
        color: #212529;
        border-radius: 12px;
        overflow: hidden;
        z-index: 1200;
        border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .lista-notificaciones {
        max-height: 340px;
        overflow-y: auto;
    }

    .notificacion-item {
        padding: 1rem;
        border-bottom: 1px solid #edf0f2;
        background: #fff;
    }

    .notificacion-item.no-leida {
        background: #fff5f6;
    }

    .bg-ues-red {
        background-color: #990c14;
    }

    .text-ues-red {
        color: #990c14;
    }

    @media (max-width: 768px) {
        .panel-notificaciones {
            right: auto;
            left: 0;
        }
    }
</style>
