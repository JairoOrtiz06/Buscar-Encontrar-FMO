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
    box-shadow: 0 6px 20px rgba(64, 3, 8, 0.2);
  }

  .header-wrap {
    width: min(1320px, 98%);
    margin: 0 auto;
    padding: 1rem 0;
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

  .nav-btn,
  .logout-btn {
    min-height: 2.35rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-weight: 700;
    border-radius: 10px;
    padding: 0.52rem 0.78rem;
    cursor: pointer;
    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.25s ease;
    line-height: 1.1;
    font-size: 0.85rem;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(55, 2, 6, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .nav-btn:hover,
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 5px 13px rgba(55, 2, 6, 0.18);
    transform: translateY(-1px);
  }

  .nav-btn.active {
    background: rgba(255, 255, 255, 0.94);
    border-color: rgba(255, 255, 255, 0.7);
    color: #990c14;
    box-shadow: 0 4px 12px rgba(55, 2, 6, 0.16);
  }

  .logout-btn {
    margin-left: 0.08rem;
    background: rgba(255, 255, 255, 0.24);
    font-weight: 800;
  }

  .nav-btn:focus-visible,
  .logout-btn:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.95);
    outline-offset: 2px;
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
