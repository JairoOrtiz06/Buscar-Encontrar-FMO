<script>
  import { usuarioActual } from '../stores/authStore.js';
  import Navbar from '../componentes/Navbar.svelte';
  import Footer from '../componentes/Footer.svelte';
</script>

<main class="inicio-layout">
  <Navbar paginaActual="inicio" />

  <section class="inicio-main">
    <div class="panel">
      <div class="panel-header">
        <h2>Panel Principal</h2>
      </div>

      <div class="panel-body">
        <div class="welcome-block">
          <h3>Sistema de Objetos Perdidos y Encontrados</h3>
          <p>Bienvenido, {$usuarioActual?.nombre}. Tu sesión está activa.</p>
        </div>

        <div class="status-grid">
          <article class="status-card">
            <p class="label">Tipo de usuario</p>
            <p class="value role">{$usuarioActual?.tipo}</p>
          </article>

          <article class="status-card">
            <p class="label">Estado de sesión</p>
            <p class="value online">Activa</p>
          </article>

          <article class="status-card">
            <p class="label">Mis publicaciones</p>
            <p class="value summary">{$usuarioActual?.totalPublicaciones ?? 0}</p>
          </article>

          <article class="status-card">
            <p class="label">Mis reclamos</p>
            <p class="value summary">{$usuarioActual?.totalReclamos ?? 0}</p>
          </article>
        </div>

        <div class="notice">
          Esta es la página de inicio. Usa el menú superior para publicar, buscar o revisar tu historial.
        </div>
      </div>
    </div>
  </section>

  <Footer />
</main>

<style>
  .inicio-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f4f6f8;
  }

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

  .inicio-main {
    flex: 1;
    width: min(980px, 92%);
    margin: clamp(1.2rem, 4vw, 2.5rem) auto;
  }

  .panel {
    border-radius: 18px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 12px 32px rgba(24, 28, 36, 0.12);
  }

  .panel-header {
    background: #990c14;
    padding: 1.1rem;
    text-align: center;
  }

  .panel-header h2 {
    margin: 0;
    color: #fff;
    font-size: clamp(1.35rem, 3.2vw, 2rem);
    font-weight: 800;
  }

  .panel-body {
    padding: clamp(1rem, 4vw, 2.2rem);
  }

  .welcome-block {
    text-align: center;
    margin-bottom: 1.4rem;
  }

  .welcome-block h3 {
    margin: 0 0 0.5rem;
    color: #990c14;
    font-size: clamp(1.2rem, 2.4vw, 2rem);
  }

  .welcome-block p {
    margin: 0;
    color: #6b7280;
    font-size: clamp(0.95rem, 2vw, 1.2rem);
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .status-card {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f9fafb;
    padding: 1rem;
    text-align: center;
  }

  .label {
    margin: 0;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
  }

  .value {
    margin: 0.45rem 0 0;
    font-size: clamp(1.25rem, 3vw, 1.9rem);
    font-weight: 800;
  }

  .role {
    color: #990c14;
  }

  .online {
    color: #0f9d58;
  }

  .summary {
    color: #1f2937;
  }

  .notice {
    margin-top: 1.2rem;
    border-radius: 12px;
    padding: 0.95rem 1rem;
    background: #990c14;
    color: #fff;
    font-weight: 700;
    text-align: center;
  }

  .inicio-footer {
    background: #1f1f24;
    color: #f3f4f6;
    padding: 1rem 0;
    border-top: 4px solid #990c14;
  }

  .footer-wrap {
    width: min(1100px, 94%);
    margin: 0 auto;
    text-align: center;
  }

  .footer-wrap h4 {
    margin: 0 0 0.2rem;
    color: #ffffff;
    font-size: clamp(1.15rem, 2.2vw, 1.55rem);
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .footer-wrap p {
    margin: 0;
    color: #d1d5db;
    font-size: 0.95rem;
    font-weight: 600;
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
      justify-content: flex-end;
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

    .status-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
