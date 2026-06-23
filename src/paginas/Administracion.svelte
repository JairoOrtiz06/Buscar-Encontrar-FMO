<script>
    import UsuariosAdmin from "./UsuariosAdmin.svelte";
    import ObjetosAdmin from "./ObjetosAdmin.svelte";
    import ReclamosAdmin from "./ReclamosAdmin.svelte";
    import EstadisticasAdmin from './EstadisticasAdmin.svelte';

    import { logout } from '../stores/authStore.js';
    import { irA } from '../stores/navegacionStore.js';

    function cerrarSesion() {
        logout();
        irA('login');
    }

    let pestaña = "usuarios";
</script>

<main class="min-vh-100 d-flex flex-column bg-light">
    <div class="container-fluid admin-navbar bg-ues-red text-white py-3 px-4 shadow-sm mb-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
            <div class="text-center text-lg-start">
                <h1 class="h2 fw-bold mb-1">Encuentra UES-FMO</h1>
                <p class="mb-0 small">Panel de Administracion</p>
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-2">
                <button
                    class="btn btn-sm {pestaña === 'usuarios' ? 'btn-light text-ues-red fw-bold' : 'btn-outline-light'}"
                    on:click={() => pestaña = "usuarios"}>
                    Usuarios
                </button>

                <button
                    class="btn btn-sm {pestaña === 'objetos' ? 'btn-light text-ues-red fw-bold' : 'btn-outline-light'}"
                    on:click={() => pestaña = "objetos"}>
                    Objetos
                </button>

                <button
                    class="btn btn-sm {pestaña === 'reclamos' ? 'btn-light text-ues-red fw-bold' : 'btn-outline-light'}"
                    on:click={() => pestaña = "reclamos"}>
                    Reclamos
                </button>

                <button
                    class="btn btn-sm {pestaña === 'estadisticas' ? 'btn-light text-ues-red fw-bold' : 'btn-outline-light'}"
                    on:click={() => pestaña = "estadisticas"}>
                    Estadisticas
                </button>
            </div>

            <button
                class="btn btn-sm btn-light text-ues-red fw-bold px-3"
                on:click={cerrarSesion}>
                Cerrar sesion
            </button>
        </div>
    </div>

    <section class="flex-grow-1 d-flex flex-column">
        {#if pestaña === "usuarios"}
            <UsuariosAdmin />
        {:else if pestaña === "objetos"}
            <ObjetosAdmin />
        {:else if pestaña === "reclamos"}
            <ReclamosAdmin />
        {:else if pestaña === "estadisticas"}
            <EstadisticasAdmin />
        {/if}
    </section>
</main>

<style>
    .bg-ues-red {
        background-color: #990c14;
    }

    .text-ues-red {
        color: #990c14;
    }

    .admin-navbar .btn-outline-light:hover,
    .admin-navbar .btn-outline-light:focus {
        color: #990c14;
        background-color: #fff;
        border-color: #fff;
    }
</style>
