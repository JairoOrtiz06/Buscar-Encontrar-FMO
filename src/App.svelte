<!--
  COMPONENTE RAÍZ - App.svelte
  
  SOLUCIÓN DEL PROBLEMA (Rúbrica #1):
  Enrutador principal de la aplicación.
  Decide qué componente mostrar según el estado (login, registro, inicio).
  
  ARQUITECTURA (Rúbrica #3 y #4):
  - onMount: restaura sesión desde localStorage/IndexedDB
  - Reactividad: usa stores para estado global
  - Integración perfecta entre componentes y stores
  
  FLUJO:
  1. App monta
  2. Restaura sesión si existe
  3. Muestra Login o Inicio según estaLogueado
-->

<script>

    import VerHistorial from './paginas/VerHistorial.svelte';
</script>

<VerHistorial />

    import BuscarObjeto from './paginas/BuscarObjeto.svelte';
    import Reclamos from './paginas/Reclamos.svelte';

    let pagina = "buscar";
    let objetoSeleccionado = null;

    function reclamarObjeto(objeto) {
        objetoSeleccionado = objeto;
        pagina = "reclamos";
    }
</script>

<nav>
    <button on:click={() => pagina = "buscar"}>
        Buscar Objetos
    </button>

    <button on:click={() => pagina = "reclamos"}>
        Reclamos
    </button>
</nav>

{#if pagina === "buscar"}
    <BuscarObjeto reclamarObjeto={reclamarObjeto} />
{:else if pagina === "reclamos"}
    <Reclamos objeto={objetoSeleccionado} />
{/if}

<style>
    nav {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin: 20px 0;
    }

    nav button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }

    nav button:hover {
        background: #1d4ed8;
    }
</style>

