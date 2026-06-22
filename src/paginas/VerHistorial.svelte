<script>
  import { onMount } from 'svelte';
  import { getHistorialUsuario, actualizarEstado, eliminarObjeto, restaurarObjeto } from '../crud/objetos.js';
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';

  const enlaces = [
    { label: 'Inicio', key: 'inicio' },
    { label: 'Publicar Objeto', key: 'publicar' },
    { label: 'Buscar Objeto', key: 'buscar' },
    { label: 'Mi Historial', key: 'historial' },
    { label: 'Reclamos', key: 'reclamos' }
  ];

  const estados = ['todos', 'pendiente', 'reclamado', 'entregado'];
  const etiquetasEstado = {
    todos: 'Todos',
    pendiente: 'Pendientes',
    reclamado: 'Reclamados',
    entregado: 'Entregados'
  };

  let usuarioId = 1;
  let objetos = [];
  let cargando = true;
  let mensaje = '';
  let objetoSeleccionado = null;
  let mostrandoModal = false;
  let filtroEstado = 'todos';

  onMount(async () => {
    await cargarHistorial();
  });

  async function cargarHistorial() {
    cargando = true;
    mensaje = '';

    try {
      if (filtroEstado === 'todos') {
        objetos = await getHistorialUsuario(usuarioId);
      } else {
        const todos = await getHistorialUsuario(usuarioId);
        objetos = todos.filter((objeto) => objeto.estado === filtroEstado);
      }
    } catch (error) {
      console.error(error);
      mensaje = '❌ Error al cargar el historial';
    } finally {
      cargando = false;
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      await actualizarEstado(id, nuevoEstado);
      mensaje = '✅ Estado actualizado correctamente';
      await cargarHistorial();
      cerrarModal();
    } catch (error) {
      console.error(error);
      mensaje = '❌ Error al actualizar el estado';
    }
  }

  async function eliminarPublicacion(id) {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await eliminarObjeto(id);
      mensaje = '✅ Publicación eliminada';
      cerrarModal();
      await cargarHistorial();
    } catch (error) {
      console.error(error);
      mensaje = '❌ Error al eliminar';
    }
  }

  async function restaurarPublicacion(id) {
    try {
      await restaurarObjeto(id);
      mensaje = '✅ Publicación restaurada';
      cerrarModal();
      await cargarHistorial();
    } catch (error) {
      console.error(error);
      mensaje = '❌ Error al restaurar';
    }
  }

  function abrirOpciones(objeto) {
    objetoSeleccionado = objeto;
    mostrandoModal = true;
  }

  function cerrarModal() {
    mostrandoModal = false;
    objetoSeleccionado = null;
  }

  function cambiarFiltro(nuevoFiltro) {
    filtroEstado = nuevoFiltro;
    cargarHistorial();
  }

  function getColorEstado(estado) {
    switch (estado) {
      case 'pendiente':
        return '#15803d';
      case 'reclamado':
        return '#a16207';
      case 'entregado':
        return '#1d4ed8';
      case 'eliminado':
        return '#b91c1c';
      default:
        return '#4b5563';
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<main class="historial-layout">
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
              class:active={enlace.key === 'historial'}
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

  <section class="historial-main">
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Mi actividad</p>
          <h1>Mis publicaciones</h1>
          <p class="panel-subtitle">Consulta y administra los objetos que has reportado.</p>
        </div>
        <div class="summary-box" aria-label="Resumen de publicaciones">
          <span class="summary-number">{objetos.length}</span>
          <span>mostradas</span>
        </div>
      </div>

      <div class="panel-body">
        {#if mensaje}
          <div class="alert" class:alert-danger={mensaje.startsWith('❌')} class:alert-success={mensaje.startsWith('✅')}>
            {mensaje}
          </div>
        {/if}

        <div class="toolbar">
          <div>
            <h2>Filtrar por estado</h2>
            <p>Encuentra rápidamente las publicaciones que necesitas revisar.</p>
          </div>
          <div class="filter-group" aria-label="Filtros del historial">
            {#each estados as estado}
              <button
                type="button"
                class="filter-btn"
                class:active={filtroEstado === estado}
                aria-pressed={filtroEstado === estado}
                on:click={() => cambiarFiltro(estado)}
              >
                {etiquetasEstado[estado]}
              </button>
            {/each}
          </div>
        </div>

        {#if cargando}
          <div class="state-card" aria-live="polite">
            <span class="spinner" aria-hidden="true"></span>
            <h2>Cargando publicaciones</h2>
            <p>Estamos preparando tu historial.</p>
          </div>
        {:else if objetos.length === 0}
          <div class="state-card">
            <span class="state-icon" aria-hidden="true">📭</span>
            <h2>No hay publicaciones con este filtro</h2>
            <p>Puedes elegir otro estado o registrar un objeto encontrado.</p>
            <button type="button" class="btn btn-primary" on:click={() => irA('publicar')}>
              Publicar un objeto
            </button>
          </div>
        {:else}
          <div class="history-list">
            {#each objetos as objeto}
              <article class="history-card">
                <div class="media-wrap">
                  {#if objeto.foto}
                    <img src={objeto.foto} alt={`Fotografía de ${objeto.titulo}`} class="object-image" />
                  {:else}
                    <div class="no-image" aria-label="Publicación sin fotografía">📦</div>
                  {/if}
                </div>

                <div class="card-content">
                  <div class="card-title-row">
                    <div>
                      <p class="category">{objeto.categoria}</p>
                      <h3>{objeto.titulo}</h3>
                    </div>
                    <span class="status-badge" style={`--status-color: ${getColorEstado(objeto.estado)}`}>
                      {objeto.estado}
                    </span>
                  </div>

                  <div class="metadata">
                    <span><strong>Ubicación:</strong> {objeto.ubicacion}</span>
                    <span><strong>Publicado:</strong> {formatearFecha(objeto.fechaPublicacion)}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <button
                    type="button"
                    class="options-btn"
                    aria-label={`Abrir opciones de ${objeto.titulo}`}
                    on:click={() => abrirOpciones(objeto)}
                  >
                    <span aria-hidden="true">⋮</span>
                  </button>
                </div>
              </article>
            {/each}
          </div>

          <p class="total">{objetos.length} publicación(es) en este filtro</p>
        {/if}
      </div>
    </article>
  </section>

  <footer class="inicio-footer">
    <div class="footer-wrap">
      <h4>Encuentra UES-FMO</h4>
      <p>Plataforma universitaria para recuperar objetos perdidos y reportar hallazgos.</p>
    </div>
  </footer>
</main>

{#if mostrandoModal && objetoSeleccionado}
  <div class="modal-layer">
    <button type="button" class="modal-backdrop" aria-label="Cerrar opciones" on:click={cerrarModal}></button>
    <dialog open class="modal-card" aria-labelledby="modal-title">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Administrar publicación</p>
          <h2 id="modal-title">Opciones</h2>
        </div>
        <button type="button" class="modal-close" aria-label="Cerrar modal" on:click={cerrarModal}>×</button>
      </div>

      <p class="selected-title">{objetoSeleccionado.titulo}</p>

      <div class="option-list">
        {#if objetoSeleccionado.estado === 'pendiente'}
          <button type="button" class="option-btn" on:click={() => cambiarEstado(objetoSeleccionado.id, 'reclamado')}>
            Marcar como reclamado
          </button>
          <button type="button" class="option-btn" on:click={() => cambiarEstado(objetoSeleccionado.id, 'entregado')}>
            Marcar como entregado
          </button>
        {:else if objetoSeleccionado.estado === 'reclamado'}
          <button type="button" class="option-btn" on:click={() => cambiarEstado(objetoSeleccionado.id, 'entregado')}>
            Confirmar entrega
          </button>
          <button type="button" class="option-btn" on:click={() => cambiarEstado(objetoSeleccionado.id, 'pendiente')}>
            Cancelar reclamo
          </button>
        {:else if objetoSeleccionado.estado === 'entregado'}
          <button type="button" class="option-btn" on:click={() => cambiarEstado(objetoSeleccionado.id, 'archivado')}>
            Archivar publicación
          </button>
        {:else if objetoSeleccionado.estado === 'eliminado'}
          <button type="button" class="option-btn" on:click={() => restaurarPublicacion(objetoSeleccionado.id)}>
            Restaurar publicación
          </button>
        {/if}

        <button type="button" class="option-btn danger" on:click={() => eliminarPublicacion(objetoSeleccionado.id)}>
          Eliminar publicación
        </button>
      </div>

      <button type="button" class="btn btn-secondary modal-cancel" on:click={cerrarModal}>Cerrar</button>
    </dialog>
  </div>
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .historial-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f4f6f8;
  }

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
    color: #fff;
    font-size: clamp(1rem, 1.45vw, 1.15rem);
    font-weight: 800;
    white-space: nowrap;
  }

  .header-center {
    min-height: 1px;
  }

  .header-right {
    justify-self: end;
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
    border-radius: 10px;
    padding: 0.52rem 0.78rem;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(55, 2, 6, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.25s ease;
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

  .historial-main {
    flex: 1;
    width: min(1100px, 94%);
    margin: clamp(1rem, 3vw, 2rem) auto;
  }

  .panel {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: clamp(1.1rem, 3vw, 1.7rem);
    background: #990c14;
    color: #fff;
  }

  .eyebrow {
    margin: 0 0 0.25rem;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .panel-header h1,
  .modal-header h2 {
    margin: 0;
  }

  .panel-header h1 {
    font-size: clamp(1.4rem, 3vw, 2rem);
  }

  .panel-subtitle {
    margin: 0.35rem 0 0;
    color: #fee2e2;
  }

  .summary-box {
    min-width: 105px;
    padding: 0.65rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    text-align: center;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .summary-number {
    display: block;
    font-size: 1.45rem;
    line-height: 1;
  }

  .panel-body {
    display: grid;
    gap: 1.2rem;
    padding: clamp(1rem, 3vw, 1.7rem);
  }

  .alert {
    border: 1px solid #bae6fd;
    border-radius: 10px;
    padding: 0.8rem 0.95rem;
    background: #f0f9ff;
    color: #075985;
    font-weight: 700;
  }

  .alert-success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }

  .alert-danger {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .toolbar {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .toolbar h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1rem;
  }

  .toolbar p {
    margin: 0.25rem 0 0;
    color: #6b7280;
    font-size: 0.88rem;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.45rem;
  }

  .filter-btn {
    border: 1px solid #d1d5db;
    border-radius: 9px;
    padding: 0.52rem 0.78rem;
    background: #fff;
    color: #374151;
    font-family: inherit;
    font-size: 0.84rem;
    font-weight: 800;
    cursor: pointer;
  }

  .filter-btn:hover,
  .filter-btn.active {
    border-color: #990c14;
    background: #990c14;
    color: #fff;
  }

  .history-list {
    display: grid;
    gap: 0.85rem;
  }

  .history-card {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    padding: 0.9rem;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #fff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .history-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  .object-image,
  .no-image {
    width: 108px;
    height: 92px;
    border-radius: 10px;
  }

  .object-image {
    display: block;
    object-fit: cover;
    border: 1px solid #e5e7eb;
  }

  .no-image {
    display: grid;
    place-items: center;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 2rem;
  }

  .card-content {
    min-width: 0;
  }

  .card-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .card-title-row h3 {
    margin: 0.15rem 0 0;
    overflow-wrap: anywhere;
    color: #111827;
    font-size: 1.08rem;
  }

  .category {
    margin: 0;
    color: #990c14;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .status-badge {
    flex: none;
    border-radius: 999px;
    padding: 0.3rem 0.62rem;
    background: var(--status-color);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 900;
    text-transform: capitalize;
  }

  .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.25rem;
    margin-top: 0.7rem;
    color: #6b7280;
    font-size: 0.84rem;
  }

  .metadata strong {
    color: #374151;
  }

  .options-btn,
  .modal-close {
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    font-family: inherit;
    cursor: pointer;
  }

  .options-btn {
    width: 40px;
    height: 40px;
    background: #990c14;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 900;
  }

  .options-btn:hover {
    background: #7c0910;
  }

  .total {
    margin: 0;
    color: #6b7280;
    text-align: center;
    font-size: 0.88rem;
    font-weight: 700;
  }

  .state-card {
    display: grid;
    justify-items: center;
    padding: clamp(2.5rem, 7vw, 4.5rem) 1rem;
    border: 1px dashed #d1d5db;
    border-radius: 14px;
    background: #f9fafb;
    color: #6b7280;
    text-align: center;
  }

  .state-card h2 {
    margin: 0.8rem 0 0;
    color: #1f2937;
    font-size: 1.15rem;
  }

  .state-card p {
    margin: 0.35rem 0 1rem;
  }

  .state-icon {
    font-size: 2.4rem;
  }

  .spinner {
    width: 34px;
    height: 34px;
    border: 4px solid #e5e7eb;
    border-top-color: #990c14;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.68rem 1rem;
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 800;
    cursor: pointer;
  }

  .btn-primary {
    border-color: #990c14;
    background: #990c14;
    color: #fff;
  }

  .btn-primary:hover {
    background: #7c0910;
  }

  .btn-secondary {
    border-color: #d1d5db;
    background: #fff;
    color: #374151;
  }

  .inicio-footer {
    border-top: 4px solid #990c14;
    background: #1f1f24;
    color: #f3f4f6;
    padding: 1rem 0;
  }

  .footer-wrap {
    width: min(1100px, 94%);
    margin: 0 auto;
    text-align: center;
  }

  .footer-wrap h4 {
    margin: 0 0 0.2rem;
    color: #fff;
    font-size: clamp(1.15rem, 2.2vw, 1.55rem);
    font-weight: 900;
  }

  .footer-wrap p {
    margin: 0;
    color: #d1d5db;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .modal-layer {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.68);
    cursor: default;
  }

  .modal-card {
    position: relative;
    z-index: 1;
    width: min(430px, 100%);
    margin: 0;
    border: 0;
    border-radius: 15px;
    padding: 1.25rem;
    background: #fff;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .modal-header .eyebrow {
    color: #990c14;
  }

  .modal-header h2 {
    color: #111827;
    font-size: 1.35rem;
  }

  .modal-close {
    flex: none;
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    color: #374151;
    font-size: 1.4rem;
  }

  .selected-title {
    margin: 1rem 0;
    border-radius: 9px;
    padding: 0.7rem 0.8rem;
    background: #f9fafb;
    color: #374151;
    font-weight: 800;
  }

  .option-list {
    display: grid;
    gap: 0.55rem;
  }

  .option-btn {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    padding: 0.75rem;
    background: #fff;
    color: #374151;
    font-family: inherit;
    font-weight: 750;
    text-align: left;
    cursor: pointer;
  }

  .option-btn:hover {
    border-color: #990c14;
    background: #fff7f7;
    color: #990c14;
  }

  .option-btn.danger {
    border-color: #fecaca;
    color: #b91c1c;
  }

  .option-btn.danger:hover {
    border-color: #b91c1c;
    background: #fef2f2;
  }

  .modal-cancel {
    width: 100%;
    margin-top: 1rem;
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
      white-space: normal;
      line-height: 1.2;
    }

    .nav-grid {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .nav-btn,
    .logout-btn {
      flex: 1 1 calc(50% - 0.42rem);
      text-align: center;
    }

    .historial-main {
      width: min(96%, 700px);
    }

    .panel-header,
    .toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .summary-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .summary-number {
      display: inline;
    }

    .filter-group {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .history-card {
      grid-template-columns: 82px minmax(0, 1fr) auto;
      gap: 0.7rem;
      align-items: start;
    }

    .object-image,
    .no-image {
      width: 82px;
      height: 82px;
    }

    .card-title-row {
      flex-direction: column-reverse;
      gap: 0.45rem;
    }

    .metadata {
      display: grid;
      gap: 0.25rem;
    }

    .options-btn {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 520px) {
    .history-card {
      grid-template-columns: 72px minmax(0, 1fr);
      position: relative;
    }

    .object-image,
    .no-image {
      width: 72px;
      height: 72px;
    }

    .card-actions {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
    }

    .card-content {
      padding-right: 2.5rem;
    }

    .status-badge {
      max-width: calc(100% - 0.5rem);
    }
  }
</style>
