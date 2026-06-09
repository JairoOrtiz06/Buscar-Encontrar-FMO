<script>
    import UsuariosAdmin from "./UsuariosAdmin.svelte";

    import ObjetosAdmin from "./ObjetosAdmin.svelte";

    import ReclamosAdmin from "./ReclamosAdmin.svelte";

    import EstadisticasAdmin from './EstadisticasAdmin.svelte';

    let pestaña = "usuarios";
</script>

<h1>Panel de Administración</h1>
<div class="tabs">

    <button
        class:activo={pestaña === "usuarios"}
        on:click={() => pestaña = "usuarios"}>
        👤 Usuarios
    </button>

    <button
        class:activo={pestaña === "objetos"}
        on:click={() => pestaña = "objetos"}>
        📦 Objetos
    </button>

    <button
        class:activo={pestaña === "reclamos"}
        on:click={() => pestaña = "reclamos"}>
        📋 Reclamos
    </button>

    <button
        class:activo={pestaña === "estadisticas"}
        on:click={() => pestaña = "estadisticas"}>
        📊 Estadísticas
    </button>

</div>

{#if pestaña === "usuarios"}
    <UsuariosAdmin />
{/if}

{#if pestaña === "objetos"}
    <ObjetosAdmin />
{/if}

{#if pestaña === "reclamos"}
    <ReclamosAdmin />
{/if}

{#if pestaña === "estadisticas"}
    <EstadisticasAdmin />
{/if}
<style>
    .tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin: 25px 0;
    flex-wrap: wrap;
}

.tabs button {
    border: none;
    padding: 12px 22px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;

    background: #e5e7eb;
    color: #374151;

    transition: all 0.3s ease;
}

.tabs button:hover {
    background: #dbeafe;
    transform: translateY(-2px);
}

.tabs button.activo {
    background: #2563eb;
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}
</style>