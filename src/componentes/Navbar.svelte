<script>
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';

  export let paginaActual = 'inicio';

  const enlaces = [
    { label: 'Inicio', key: 'inicio' },
    { label: 'Publicar Objeto', key: 'publicar' },
    { label: 'Buscar Objeto', key: 'buscar' },
    { label: 'Mi Historial', key: 'historial' },
    { label: 'Reclamos', key: 'reclamos' }
  ];
</script>

<header class="inicio-header">
  <div class="header-wrap">
    <div class="header-left">
      <p class="hello-text">Hola, {$usuarioActual?.nombre}</p>
    </div>

    <div class="header-center"></div>

    <div class="header-right">
      <nav class="nav-grid" aria-label="Navegación principal">
        {#each enlaces as enlace}
          <button
            type="button"
            class="nav-btn"
            class:active={enlace.key === paginaActual}
            on:click={() => irA(enlace.key)}
          >
            {enlace.label}
          </button>
        {/each}
        <button
          type="button"
          class="logout-btn"
          on:click={() => {
            logout();
            irA('login');
          }}
        >
          Salir
        </button>
      </nav>
    </div>
  </div>
</header>

<style>
  .inicio-header {
    background: #990c14;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
  }

  .header-wrap {
    width: min(1320px, 98%);
    margin: 0 auto;
    padding: 0.72rem 0;
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 1fr minmax(760px, auto);
    align-items: center;
    column-gap: 0.25rem;
  }

  .header-left {
    justify-self: start;
    min-width: 0;
  }

  .hello-text {
    margin: 0;
    font-size: clamp(1rem, 1.45vw, 1.15rem);
    font-weight: 800;
    color: #fff;
    white-space: nowrap;
  }

  .header-center {
    min-height: 1px;
  }

  .header-right {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .nav-grid {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0.42rem;
  }

  .nav-btn {
    border: 1px solid #fff;
    background: transparent;
    color: #fff;
    font-weight: 700;
    border-radius: 9px;
    padding: 0.44rem 0.68rem;
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1.1;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .nav-btn:hover,
  .nav-btn.active {
    background: #fff;
    color: #990c14;
  }

  .logout-btn {
    border: none;
    background: #fff;
    color: #990c14;
    font-weight: 900;
    border-radius: 9px;
    padding: 0.5rem 0.9rem;
    cursor: pointer;
    line-height: 1.1;
    white-space: nowrap;
    font-size: 0.86rem;
  }

  @media (max-width: 1200px) and (min-width: 769px) {
    .header-wrap {
      grid-template-columns: 1fr;
      row-gap: 0.7rem;
    }

    .header-left,
    .header-right {
      justify-self: center;
    }

    .hello-text {
      text-align: center;
      max-width: 100%;
    }

    .header-right {
      width: 100%;
    }

    .nav-grid {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 768px) {
    .header-wrap {
      width: min(97%, 700px);
      grid-template-columns: 1fr;
      row-gap: 0.6rem;
    }

    .header-left,
    .header-right {
      justify-self: stretch;
      width: 100%;
    }

    .hello-text {
      text-align: left;
      white-space: normal;
      line-height: 1.2;
    }

    .nav-grid {
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 0.42rem;
    }

    .nav-btn,
    .logout-btn {
      flex: 1 1 calc(50% - 0.42rem);
      text-align: center;
    }
  }
</style>
