<script>
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';

  export let paginaActual = 'inicio';

  function ir(pagina, ruta, requiereAuth = false) {
    const usuario = $usuarioActual;
    if (requiereAuth && !usuario) {
      irA('login');
      return;
    }
    irA(pagina);
    try { window.history.pushState({}, '', ruta); } catch (e) {}
  }

  function cerrarSesion() {
    logout();
    irA('inicio');
    try { window.history.pushState({}, '', '/'); } catch (e) {}
  }
</script>

<!-- Top red bar with centered greeting -->
<div class="top-bar">
  <div class="top-inner">
    {#if $usuarioActual}
      <div class="greeting">Hola, {$usuarioActual.nombre}</div>
    {:else}
      <div class="greeting">Bienvenido a Encuentra UES</div>
    {/if}
  </div>
</div>

<!-- Pill navigation below -->
<nav class="pill-nav">
  <div class="nav-inner">
    <button class="pill" on:click={() => ir('inicio', '/')}>Inicio</button>
    <button class="pill" on:click={() => ir('publicar', '/publicar', true)}>Publicar Objeto</button>
    <button class="pill" on:click={() => ir('buscar', '/buscar')}>Buscar Objeto</button>
    <button class="pill" on:click={() => ir('historial', '/historial', true)}>Mi Historial</button>
    <button class="pill" on:click={() => ir('reclamos', '/reclamos', true)}>Reclamos</button>
    {#if $usuarioActual}
      <button class="pill pill-logout" on:click={cerrarSesion}>Salir</button>
    {:else}
      <button class="pill" on:click={() => ir('login', '/login')}>Login</button>
    {/if}
  </div>
</nav>

<style>
  :global(.top-bar) {
    background: #990c14;
    border-bottom: 4px solid #7a0a10;
    color: white;
  }

  .top-inner {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0.6rem 1rem;
    text-align: center;
    font-weight: 800;
  }

  .greeting { font-size: 1rem; }

  .pill-nav {
    background: #8b0b11;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  .nav-inner {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0.6rem 1rem;
    display: flex;
    gap: 0.6rem;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }

  .pill {
    background: #fff;
    color: #990c14;
    border: 1px solid rgba(0,0,0,0.06);
    padding: 0.38rem 0.9rem;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  .pill-logout {
    background: #fff;
    color: #990c14;
  }

  .pill:hover { transform: translateY(-1px); }

  @media (max-width: 768px) {
    .nav-inner { justify-content: center; }
  }
</style>