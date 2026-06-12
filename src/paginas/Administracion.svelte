<script>
    import UsuariosAdmin from "./UsuariosAdmin.svelte";

    import ObjetosAdmin from "./ObjetosAdmin.svelte";

    import ReclamosAdmin from "./ReclamosAdmin.svelte";

    import EstadisticasAdmin from './EstadisticasAdmin.svelte';

    let pestaña = "usuarios";
</script>
<div class="header-admin">

    <div class="titulo">
        <h1>Encuentra UES-FMO</h1>
        <p>Panel de Administración</p>
    </div>

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
   .header-admin {
    background: linear-gradient(
        135deg,
        #b30000,
        #d90429
    );

    color: white;

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 20px 35px;

    border-radius: 18px;

    margin-bottom: 25px;

    box-shadow: 0 8px 20px rgba(0,0,0,.15);
}

.titulo h1 {
    margin: 0;
    font-size: 2rem;
}

.titulo p {
    margin: 5px 0 0 0;
    opacity: .9;
}
.tabs {
    display: flex;
    gap: 10px;
}
.tabs button {
    background: rgba(255,255,255,.15);

    border: 1px solid rgba(255,255,255,.25);

    color: white;

    padding: 10px 18px;

    border-radius: 10px;

    cursor: pointer;

    transition: .3s;
}
.tabs button:hover {
    background: rgba(255,255,255,.25);
}
.tabs button.activo {
    background: white;
    color: #b30000;
    font-weight: bold;
}
@media (max-width: 900px) {

    .header-admin {
        flex-direction: column;
        gap: 20px;
        text-align: center;
    }

    .tabs {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

}
@media (max-width: 600px) {

    .tabs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        width: 100%;
        gap: 8px;
    }

    .tabs button {
        width: 100%;
        padding: 8px;
        font-size: 0.85rem;
    }

    .titulo h1 {
        font-size: 1.5rem;
    }

}
</style>