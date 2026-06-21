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

<div class="container bg-danger bg-gradient text-white p-4 rounded shadow mb-4">

    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">

        <div class="text-center text-lg-start">
            <h1 class="mb-1">Encuentra UES-FMO</h1>
            <p class="mb-0">Panel de Administración</p>
        </div>

        <div class="d-flex flex-wrap justify-content-center gap-2">
            <button
                class="btn {pestaña === 'usuarios' ? 'btn-light text-danger fw-bold' : 'btn-outline-light'}"
                on:click={() => pestaña = "usuarios"}>
                Usuarios
            </button>

            <button
                class="btn {pestaña === 'objetos' ? 'btn-light text-danger fw-bold' : 'btn-outline-light'}"
                on:click={() => pestaña = "objetos"}>
                Objetos
            </button>

            <button
                class="btn {pestaña === 'reclamos' ? 'btn-light text-danger fw-bold' : 'btn-outline-light'}"
                on:click={() => pestaña = "reclamos"}>
                Reclamos
            </button>

            <button
                class="btn {pestaña === 'estadisticas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light'}"
                on:click={() => pestaña = "estadisticas"}>
                Estadísticas
            </button>
        </div>

        <button
            class="btn btn-light text-danger fw-bold"
            on:click={cerrarSesion}>
            Cerrar sesión
        </button>
    </div>
    
</div>

{#if pestaña === "usuarios"}
    <UsuariosAdmin />
{:else if pestaña === "objetos"}
    <ObjetosAdmin />
{:else if pestaña === "reclamos"}
    <ReclamosAdmin />
{:else if pestaña === "estadisticas"}
    <EstadisticasAdmin />
{/if}
