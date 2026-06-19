<script>
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';
</script>

<main class="contenedor-inicio">
  <header class="encabezado">
    <h1>Encuentra UES-FMO</h1>
    <nav class="navbar">

        <button on:click={() => irA('inicio')}>
          🏠 Inicio
        </button>

        <button on:click={() => irA('publicar')}>
          📦 Publicar Objeto
        </button>

        <button on:click={() => irA('buscar')}>
          🔍 Buscar Objeto
        </button>

        <button on:click={() => irA('historial')}>
          📋 Mi Historial
        </button>
        <button on:click={() => irA('reclamos')}>
          📢 Reclamos
        </button>

        <div class="usuario-info">

          <span>
            Bienvenido, {$usuarioActual.nombre}
          </span>

          <button
            on:click={() => {
              logout();
              irA('login');
            }}
          >
            🚪 Salir
          </button>

        </div>

      </nav>
  </header>

  <section class="contenido">
    <h2>Sistema de Objetos Perdidos y Encontrados</h2>
    <p>Bienvenido {$usuarioActual.nombre}. Tu sesión está activa.</p>
    <p>Tipo de usuario: <strong>{$usuarioActual.tipo}</strong></p>
    <p>Esta es la página de inicio. Los demás módulos se implementarán después.</p>
  </section>
</main>

<style>
  .contenedor-inicio {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .encabezado {
    background: rgba(0, 0, 0, 0.2);
    color: white;
    padding: 1rem 2rem;
  }

  .encabezado h1 {
    margin: 0 0 1rem 0;
  }

  .navbar {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: space-between;
  }

  .navbar a {
    color: white;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .navbar a:hover {
    opacity: 0.8;
  }

  .usuario-info {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .usuario-info button {
    background: white;
    color: #667eea;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .usuario-info button:hover {
    background: #f0f6ff;
  }

  .contenido {
    padding: 3rem 2rem;
    background: white;
    margin: 2rem;
    border-radius: 12px;
    max-width: 600px;
  }

  .contenido h2 {
    color: #667eea;
    margin-top: 0;
  }

  .contenido p {
    color: #666;
    line-height: 1.6;
  }
</style>