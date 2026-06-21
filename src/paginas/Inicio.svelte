<script>
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';
</script>

<main class="min-vh-100" style="background-color: #f4f4f4;">
  <header class="text-white shadow-sm" style="background-color: #990c14;">
    <div class="container py-4">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
        <div class="text-center text-lg-start">
          <h1 class="fw-bold mb-1 text-white">
            Encuentra UES-FMO
          </h1>
          <p class="mb-0 text-white fw-semibold">
            Sistema de Objetos Perdidos y Encontrados
          </p>
        </div>

        <div class="d-flex flex-wrap justify-content-center gap-2">
          <button class="btn btn-light fw-bold px-3" style="color: #990c14;" on:click={() => irA('inicio')}>
            Inicio
          </button>

          <button class="btn btn-outline-light fw-bold px-3" on:click={() => irA('publicar')}>
            Publicar Objeto
          </button>

          <button class="btn btn-outline-light fw-bold px-3" on:click={() => irA('buscar')}>
            Buscar Objeto
          </button>

          <button class="btn btn-outline-light fw-bold px-3" on:click={() => irA('historial')}>
            Mi Historial
          </button>

          <button class="btn btn-outline-light fw-bold px-3" on:click={() => irA('reclamos')}>
            Reclamos
          </button>
        </div>

        <div class="d-flex align-items-center gap-3">
          <span class="small fw-bold text-white">
            {$usuarioActual.nombre}
          </span>

          <button
            class="btn btn-light fw-bold px-3"
            style="color: #990c14;"
            on:click={() => {
              logout();
              irA('login');
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  </header>

  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">
        <div class="card border-0 shadow-lg">
          <div class="card-header text-white text-center py-4" style="background-color: #990c14;">
            <h2 class="fw-bold mb-0 text-white">
              Panel Principal
            </h2>
          </div>

          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h3 class="fw-bold mb-3" style="color: #990c14;">
                Sistema de Objetos Perdidos y Encontrados
              </h3>

              <p class="lead text-secondary mb-0">
                Bienvenido, {$usuarioActual.nombre}. Tu sesión está activa.
              </p>
            </div>

            <div class="row g-4 mt-2">
              <div class="col-md-6">
                <div class="border rounded-3 p-4 h-100 bg-light">
                  <p class="text-uppercase text-secondary small fw-bold mb-2">
                    Tipo de usuario
                  </p>

                  <p class="fs-4 fw-bold mb-0" style="color: #990c14;">
                    {$usuarioActual.tipo}
                  </p>
                </div>
              </div>

              <div class="col-md-6">
                <div class="border rounded-3 p-4 h-100 bg-light">
                  <p class="text-uppercase text-secondary small fw-bold mb-2">
                    Estado de sesión
                  </p>

                  <p class="fs-4 fw-bold text-success mb-0">
                    Activa
                  </p>
                </div>
              </div>
            </div>

            <div class="alert border-0 mt-4 mb-0 text-white fw-semibold" style="background-color: #990c14;">
              Esta es la página de inicio. Usa el menú superior para publicar, buscar o revisar tu historial.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>