<script>
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';
  import { onMount } from 'svelte';
  import { dbPromise } from '../base_datos/database.js';


  export let paginaActual = 'inicio';

  const enlaces = [
    { label: 'Inicio', key: 'inicio' },
    { label: 'Publicar Objeto', key: 'publicar' },
    { label: 'Buscar Objeto', key: 'buscar' },
    { label: 'Mi Historial', key: 'historial' },
    { label: 'Reclamos', key: 'reclamos' }
  ];


let fotoPerfil = '';

onMount(async () => {

    if (!$usuarioActual) return;

    const db = await dbPromise;

    const fotos =
        await db.getAllFromIndex(
            'fotos',
            'idUsuario',
            $usuarioActual.id
        );

    const perfil =
        fotos.find(
            foto => foto.tipo === 'perfil'
        );

    if (perfil) {

        fotoPerfil =
            perfil.base64;
    }
});

</script>

<header class="inicio-header">
  <div class="header-wrap">
    <div class="header-left">

        {#if fotoPerfil}
            <img
                src={fotoPerfil}
                alt="Perfil"
                class="foto-perfil"
            >
        {/if}

        <p class="hello-text">
            Hola, {$usuarioActual?.nombre}
        </p>

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
          Cerrar sesion
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
    margin-left: 0.55rem;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-weight: 800;
    box-shadow: none;
  }

  .logout-btn:hover {
    border-color: rgba(255, 255, 255, 0.72);
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
    box-shadow: 0 4px 10px rgba(55, 2, 6, 0.14);
  }

  .nav-btn:focus-visible,
  .logout-btn:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.95);
    outline-offset: 2px;
  }
  .header-left{
      display:flex;
      align-items:center;
      gap:12px;
  }

  .foto-perfil{
      width:60px;
      height:60px;
      border-radius:50%;
      object-fit:cover;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
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
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      justify-content: center;
      width: min(620px, 100%);
      margin: 0 auto;
    }

    .nav-btn,
    .logout-btn {
      width: 100%;
      margin-left: 0;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .header-wrap {
      width: min(97%, 700px);
      grid-template-columns: 1fr;
      row-gap: 0.75rem;
      padding: 0.85rem 0;
    }

    .header-left,
    .header-right {
      justify-self: stretch;
      width: 100%;
    }

    .hello-text {
      text-align: center;
      white-space: normal;
      line-height: 1.2;
    }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.42rem;
      width: 100%;
    }

    .nav-btn,
    .logout-btn {
      width: 100%;
      min-height: 2.05rem;
      margin-left: 0;
      padding: 0.45rem 0.55rem;
      font-size: 0.78rem;
      text-align: center;
    }

    .logout-btn {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 390px) {
    .nav-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
