<script>
  // ========================================
  // IMPORTACIONES
  // ========================================
  
  import { onMount } from 'svelte';
  import { paginaActual } from './stores/navegacionStore.js';
  
  // Componentes de páginas
  import Login from './paginas/Login.svelte';
  import Registro from './paginas/Registro.svelte';
  import Inicio from './paginas/Inicio.svelte';
  import Administracion from './paginas/Administracion.svelte';
  import PublicarObjeto from './paginas/PublicarObjeto.svelte';
  import BuscarObjeto from './paginas/BuscarObjeto.svelte';
  import VerHistorial from './paginas/VerHistorial.svelte';
  import Reclamos from './paginas/Reclamos.svelte';
  
  // Stores de autenticación
  import { 
    restaurarSesionDesdeStorage,
    estaLogueado,
    usuarioActual
  } from './stores/authStore.js';
  
  // ========================================
  // CICLO DE VIDA: RESTAURAR SESIÓN
  // ========================================
  
  // Se ejecuta cuando la app monta en el DOM
  // Restaura la sesión si el usuario recarga la página
  import { crearAdminPorDefecto } from './base_datos/database.js';

  onMount(async () => {
    console.log('App montada - restaurando sesión...');
    await crearAdminPorDefecto();
    await restaurarSesionDesdeStorage();
  });
</script>

<!-- ========================================
     ENRUTAMIENTO: MOSTRAR COMPONENTE SEGÚN ESTADO
     ======================================== -->

<!-- Si usuario está logueado: mostrar Inicio -->

{#if $estaLogueado}

  {#if $usuarioActual?.tipo === 'admin'}

    <Administracion />

  {:else if $paginaActual === 'inicio'}

    <Inicio />

  {:else if $paginaActual === 'publicar'}

    <PublicarObjeto />

  {:else if $paginaActual === 'buscar'}

    <BuscarObjeto />

  {:else if $paginaActual === 'historial'}

    <VerHistorial />
  {:else if $paginaActual === 'reclamos'}

  <Reclamos />

{:else if $paginaActual === 'historial'}

  <VerHistorial />
  {:else}

    <Inicio />

  {/if}

{:else if $paginaActual === 'registro'}

  <Registro />

{:else}

  <Login />

{/if}

<!-- ========================================
     ESTILOS GLOBALES
     ======================================== -->

<style>
  /* Resetear estilos del navegador */
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #346ea7;
    color: #212529;
    line-height: 1.5;
  }
  /* Estilos para inputs y select */
  :global(input, select, textarea, button) {
    font-family: inherit;
    font-size: inherit;
  }

  /* Remover estilos por defecto de inputs */
  :global(input::-webkit-outer-spin-button),
  :global(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Estilos para links */
  :global(a) {
    color: #0088CC;
    text-decoration: none;
    transition: color 0.2s;
  }

  :global(a:hover) {
    color: #006BA3;
  }

  /* Estilos para botones */
  :global(button) {
    transition: all 0.3s;
  }

  /* Scroll smooth */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>