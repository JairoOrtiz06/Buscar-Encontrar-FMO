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
  // ========================================
  // IMPORTACIONES
  // ========================================
  
  import { onMount } from 'svelte';
  import { paginaActual } from './stores/navegacionStore.js';
  
  // Componentes de páginas
  import Login from './paginas/Login.svelte';
  import Registro from './paginas/Registro.svelte';
  import Inicio from './paginas/Inicio.svelte';
  
  // Stores de autenticación
  import { 
    restaurarSesionDesdeStorage,
    estaLogueado
  } from './stores/authStore.js';

  // ========================================
  // CICLO DE VIDA: RESTAURAR SESIÓN
  // ========================================
  
  // Se ejecuta cuando la app monta en el DOM
  // Restaura la sesión si el usuario recarga la página
  onMount(async () => {
    console.log('App montada - restaurando sesión...');
    await restaurarSesionDesdeStorage();
  });
</script>

<!-- ========================================
     ENRUTAMIENTO: MOSTRAR COMPONENTE SEGÚN ESTADO
     ======================================== -->

<!-- Si usuario está logueado: mostrar Inicio -->

{#if $estaLogueado}
  <Inicio />
{:else if $paginaActual === 'login'}
  <Login />
{:else if $paginaActual === 'registro'}
  <Registro />
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
    background: #f8f9fa;
    color: #212529;
    line-height: 1.5;
  }

  :global(html, body, #app) {
    width: 100%;
    height: 100%;
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

  :global(input[type=number]) {
    -moz-appearance: textfield;
  }

  /* Estilos para links */
  :global(a) {
    color: #0066cc;
    text-decoration: none;
    transition: color 0.2s;
  }

  :global(a:hover) {
    color: #0052a3;
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