<script>
  import { onMount } from 'svelte';
  import { usuarioActual } from '../stores/authStore.js';
  import { dbPromise } from '../base_datos/database.js';
  import Navbar from '../componentes/Navbar.svelte';
  import Footer from '../componentes/Footer.svelte';

  let publicacionesPendientes = 0;
  let publicacionesReclamadas = 0;
  let publicacionesEntregadas = 0;
  let totalReclamos = 0;
  let reclamosAprobados = 0;
  let cargandoResumen = true;

  onMount(async () => {
    await cargarResumen();
  });

  async function cargarResumen() {
    cargandoResumen = true;

    try {
      if (!$usuarioActual?.id) {
        publicacionesPendientes = 0;
        publicacionesReclamadas = 0;
        publicacionesEntregadas = 0;
        totalReclamos = 0;
        reclamosAprobados = 0;
        return;
      }

      const db = await dbPromise;
      const [objetos, reclamos] = await Promise.all([
        db.getAll('objetos'),
        db.getAll('reclamos')
      ]);

      const misObjetos = objetos.filter((objeto) =>
        String(objeto.idUsuario) === String($usuarioActual.id)
      );

      publicacionesPendientes = misObjetos.filter((objeto) => objeto.estado === 'pendiente').length;
      publicacionesReclamadas = misObjetos.filter((objeto) => objeto.estado === 'reclamado').length;
      publicacionesEntregadas = misObjetos.filter((objeto) => objeto.estado === 'entregado').length;

      const misReclamos = reclamos.filter((reclamo) =>
        String(reclamo.idSolicitante) === String($usuarioActual.id)
      );

      totalReclamos = misReclamos.length;
      reclamosAprobados = misReclamos.filter((reclamo) => reclamo.estado === 'aprobado').length;
    } catch (error) {
      console.error('Error cargando resumen de inicio:', error);
      publicacionesPendientes = 0;
      publicacionesReclamadas = 0;
      publicacionesEntregadas = 0;
      totalReclamos = 0;
      reclamosAprobados = 0;
    } finally {
      cargandoResumen = false;
    }
  }
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

        {#if !cargandoResumen && reclamosAprobados > 0}
          <div class="approved-notice">
            Tienes {reclamosAprobados} reclamo{reclamosAprobados === 1 ? '' : 's'} aprobado{reclamosAprobados === 1 ? '' : 's'} pendiente{reclamosAprobados === 1 ? '' : 's'} de seguimiento.
          </div>
        {/if}

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
            <p class="label">Publicaciones pendientes</p>
            <p class="value pending">{cargandoResumen ? '...' : publicacionesPendientes}</p>
          </article>

          <article class="status-card">
            <p class="label">Publicaciones reclamadas</p>
            <p class="value claimed">{cargandoResumen ? '...' : publicacionesReclamadas}</p>
          </article>

          <article class="status-card">
            <p class="label">Publicaciones entregadas</p>
            <p class="value delivered">{cargandoResumen ? '...' : publicacionesEntregadas}</p>
          </article>

          <article class="status-card">
            <p class="label">Reclamos enviados</p>
            <p class="value summary">{cargandoResumen ? '...' : totalReclamos}</p>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .approved-notice {
    margin-bottom: 1rem;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 0.85rem 1rem;
    background: #f0fdf4;
    color: #166534;
    font-weight: 800;
    text-align: center;
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

  .pending {
    color: #15803d;
  }

  .claimed {
    color: #a16207;
  }

  .delivered {
    color: #1d4ed8;
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

  @media (max-width: 768px) {
    .status-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .status-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
