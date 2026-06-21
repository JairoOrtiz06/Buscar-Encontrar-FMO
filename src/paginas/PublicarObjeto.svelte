<script>
  import { crearObjeto, verificarDuplicado } from '../crud/objetos.js';
  import { usuarioActual, logout } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';

  const enlaces = [
    { label: 'Inicio', key: 'inicio' },
    { label: 'Publicar Objeto', key: 'publicar' },
    { label: 'Buscar Objeto', key: 'buscar' },
    { label: 'Mi Historial', key: 'historial' },
    { label: 'Reclamos', key: 'reclamos' }
  ];

  const categorias = [
    { valor: 'carnés', label: 'Carnés' },
    { valor: 'memorias usb', label: 'Memorias USB' },
    { valor: 'calculadoras', label: 'Calculadoras' },
    { valor: 'cuadernos', label: 'Cuadernos' },
    { valor: 'mochilas', label: 'Mochilas' },
    { valor: 'llaves', label: 'Llaves' },
    { valor: 'cargadores', label: 'Cargadores' },
    { valor: 'teléfonos', label: 'Teléfonos' },
    { valor: 'documentos', label: 'Documentos' },
    { valor: 'otros', label: 'Otros' }
  ];

  // Form state
  let titulo = '';
  let descripcion = '';
  let categoria = 'otros';
  let ubicacion = '';
  let foto = null;
  let vistaPrevia = null;
  let guardando = false;
  let mensaje = '';
  let duplicadoDetectado = false;

  // Procesa la imagen seleccionada
  function procesarImagen(evento) {
    const archivo = evento.target?.files && evento.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      mensaje = 'Selecciona una imagen';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      mensaje = 'La imagen debe ser menor a 5MB';
      return;
    }

    foto = archivo;
    const lector = new FileReader();
    lector.onload = (e) => (vistaPrevia = e.target.result);
    lector.readAsDataURL(archivo);

    mensaje = '';
    duplicadoDetectado = false;
  }

  function convertirImagenABase64(archivo) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.readAsDataURL(archivo);
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(lector.error);
    });
  }

  async function buscarDuplicados() {
    if (!titulo.trim() || !categoria || !ubicacion.trim()) {
      return { valido: true, duplicado: false };
    }

    try {
      const duplicado = await verificarDuplicado(titulo, categoria, ubicacion);
      return { valido: true, duplicado: !!duplicado };
    } catch (e) {
      return { valido: false, duplicado: false };
    }
  }

  async function guardarObjeto() {
    if (!titulo.trim() || !categoria || !ubicacion.trim()) {
      mensaje = 'Completa todos los campos';
      return;
    }

    mensaje = '';
    duplicadoDetectado = false;

    const verificacion = await buscarDuplicados();

    if (verificacion.duplicado) {
      duplicadoDetectado = true;
      mensaje = ' Ya existe un objeto con información similar. No se puede duplicar.';
      return;
    }

    guardando = true;

    try {
      let imagenBase64 = null;
      if (foto) {
        imagenBase64 = await convertirImagenABase64(foto);
      }

      if (!$usuarioActual?.id) {
        mensaje = 'Debes iniciar sesión para publicar el objeto.';
        guardando = false;
        return;
      }

      const objeto = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria,
        ubicacion: ubicacion.trim(),
        foto: imagenBase64,
        idUsuario: $usuarioActual.id
      };

      await crearObjeto(objeto);

      mensaje = 'Objeto publicado correctamente';

      // Volver a inicio usando el enrutador interno
      setTimeout(() => irA('inicio'), 1500);
    } catch (error) {
      console.error(error);

      if (error?.message === 'DUPLICADO') {
        duplicadoDetectado = true;
        mensaje = '⚠️ Ya existe un objeto con información similar. No se puede duplicar.';
      } else if (error?.message === 'USUARIO_NO_VALIDO') {
        mensaje = '❌ Usuario no válido. Inicia sesión de nuevo.';
      } else {
        mensaje = '❌ Error al guardar el objeto';
      }
    } finally {
      guardando = false;
    }
  }

  function quitarImagen() {
    foto = null;
    vistaPrevia = null;
  }

  $: tipoMensaje = mensaje.startsWith('✅')
    ? 'success'
    : mensaje.startsWith('⚠️')
      ? 'warning'
      : mensaje.startsWith('❌')
        ? 'danger'
        : 'info';
</script>

<main class="publicar-layout">
  <header class="inicio-header">
    <div class="header-wrap">
      <div class="header-left">
        <p class="hello-text">Hola, {$usuarioActual?.nombre}</p>
      </div>

      <div class="header-center"></div>

      <div class="header-right">
        <nav class="nav-grid" aria-label="Navegación principal">
          {#each enlaces as enlace}
            <button class="nav-btn" class:active={enlace.key === 'publicar'} on:click={() => irA(enlace.key)}>
              {enlace.label}
            </button>
          {/each}
          <button
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

  <section class="publicar-main">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-8">
          <article class="card shadow-sm mb-3">
            <div class="card-header">
              <h1 class="h4 mb-0">Publicar Objeto</h1>
              <p class="subtitle mb-0">Completa los datos para registrar un hallazgo.</p>
            </div>

            <div class="card-body">
              <form class="form-grid" on:submit|preventDefault={guardarObjeto}>
                <section class="form-section">
                  <h2 class="section-title">Datos principales</h2>

                  <div class="form-group">
                    <label for="titulo" class="form-label">Título <span class="required">*</span></label>
                    <input
                      id="titulo"
                      class="form-control"
                      type="text"
                      bind:value={titulo}
                      placeholder="Ej: Cuaderno de tapas rojas"
                      on:input={() => (duplicadoDetectado = false)}
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea
                      id="descripcion"
                      class="form-control"
                      bind:value={descripcion}
                      placeholder="Describe el objeto..."
                      rows="4"
                    ></textarea>
                  </div>
                </section>

                <section class="form-section">
                  <h2 class="section-title">Clasificación y ubicación</h2>

                  <div class="row row-gap">
                    <div class="col-12 col-md-6">
                      <div class="form-group">
                        <label for="categoria" class="form-label">Categoría <span class="required">*</span></label>
                        <select id="categoria" class="form-select" bind:value={categoria} required>
                          {#each categorias as cat}
                            <option value={cat.valor}>{cat.label}</option>
                          {/each}
                        </select>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <div class="form-group">
                        <label for="ubicacion" class="form-label"
                          >Ubicación donde lo encontraste <span class="required">*</span></label
                        >
                        <input
                          id="ubicacion"
                          class="form-control"
                          type="text"
                          bind:value={ubicacion}
                          placeholder="Ej: Biblioteca - 2do piso"
                          on:input={() => (duplicadoDetectado = false)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section class="form-section">
                  <h2 class="section-title">Imagen y vista previa</h2>

                  <div class="form-group">
                    <label for="foto" class="form-label">Foto del objeto</label>
                    <input id="foto" class="form-control" type="file" accept="image/*" on:change={procesarImagen} />
                    <small class="helper-text">Formatos imagen. Tamaño máximo: 5MB.</small>
                  </div>

                  {#if vistaPrevia}
                    <div class="preview-card">
                      <img src={vistaPrevia} alt="Vista previa del objeto" />
                      <button type="button" class="btn btn-outline-danger btn-sm" on:click={quitarImagen}>
                        Quitar imagen
                      </button>
                    </div>
                  {/if}
                </section>

                {#if mensaje}
                  <div class="alert" class:alert-success={tipoMensaje === 'success'} class:alert-warning={tipoMensaje === 'warning'} class:alert-danger={tipoMensaje === 'danger'}>
                    {mensaje}
                  </div>
                {/if}

                {#if duplicadoDetectado}
                  <div class="alert alert-warning soft-warning">
                    📝 El objeto ya existe con el mismo título, categoría y ubicación. Si crees que es diferente,
                    modifica algún campo.
                  </div>
                {/if}

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary btn-lg" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </article>
        </div>

        <aside class="col-12 col-lg-4">
          <article class="card shadow-sm side-card">
            <div class="card-header side-header">
              <h3 class="h5 mb-0">Recomendaciones</h3>
            </div>
            <div class="card-body">
              <ul class="tips-list">
                <li>Usa un título claro y específico.</li>
                <li>Indica una ubicación lo más precisa posible.</li>
                <li>Sube una imagen nítida para facilitar la identificación.</li>
                <li>Evita duplicados revisando la información antes de publicar.</li>
              </ul>
            </div>
          </article>
        </aside>
      </div>
    </div>
  </section>

  <footer class="inicio-footer">
    <div class="footer-wrap">
      <h4>Encuentra UES-FMO</h4>
      <p>Plataforma universitaria para recuperar objetos perdidos y reportar hallazgos.</p>
    </div>
  </footer>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .publicar-layout {
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

  .publicar-main {
    flex: 1;
    width: min(1200px, 94%);
    margin: clamp(1rem, 3vw, 2rem) auto;
  }

  .container {
    width: 100%;
    margin: 0 auto;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-inline: -0.5rem;
  }

  .row-gap {
    row-gap: 0.75rem;
  }

  [class*='col-'] {
    padding-inline: 0.5rem;
    width: 100%;
  }

  .col-12 {
    width: 100%;
  }

  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
  }

  .shadow-sm {
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .card-header {
    background: #990c14;
    color: #fff;
    padding: 1rem 1.1rem;
  }

  .subtitle {
    margin-top: 0.25rem;
    font-size: 0.95rem;
    color: #f3f4f6;
  }

  .card-body {
    padding: clamp(1rem, 2.5vw, 1.5rem);
  }

  .h4 {
    font-size: clamp(1.2rem, 2.2vw, 1.5rem);
    font-weight: 800;
  }

  .h5 {
    font-size: 1.08rem;
    font-weight: 800;
  }

  .mb-0 {
    margin-bottom: 0;
    margin-top: 0;
  }

  .form-grid {
    display: grid;
    gap: 1rem;
  }

  .form-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0.95rem;
    background: #f9fafb;
  }

  .section-title {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    color: #1f2937;
    font-weight: 800;
  }

  .form-group {
    display: grid;
    gap: 0.45rem;
  }

  .form-label {
    font-weight: 700;
    color: #1f2937;
  }

  .required {
    color: #b91c1c;
  }

  .form-control,
  .form-select {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #fff;
    color: #111827;
    padding: 0.7rem 0.8rem;
    font-size: 0.97rem;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .form-control:focus,
  .form-select:focus {
    outline: none;
    border-color: #990c14;
    box-shadow: 0 0 0 3px rgba(153, 12, 20, 0.16);
  }

  textarea.form-control {
    resize: vertical;
    min-height: 110px;
  }

  .helper-text {
    color: #6b7280;
    font-size: 0.82rem;
  }

  .preview-card {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px dashed #d1d5db;
    border-radius: 12px;
    padding: 0.7rem;
    background: #fff;
  }

  .preview-card img {
    width: 112px;
    height: 112px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.68rem 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.2;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .btn-primary {
    background: #990c14;
    border-color: #990c14;
    color: #fff;
    box-shadow: 0 5px 14px rgba(153, 12, 20, 0.2);
  }

  .btn-primary:hover:not(:disabled) {
    background: #7c0910;
    border-color: #7c0910;
  }

  .btn-outline-danger {
    background: #fff;
    border-color: #b91c1c;
    color: #b91c1c;
  }

  .btn-outline-danger:hover {
    background: #b91c1c;
    color: #fff;
  }

  .btn-sm {
    padding: 0.48rem 0.7rem;
    font-size: 0.84rem;
  }

  .btn-lg {
    min-height: 48px;
    padding-inline: 1.5rem;
    font-size: 1rem;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .alert {
    border: 1px solid #bae6fd;
    border-radius: 10px;
    padding: 0.8rem 0.95rem;
    background: #f0f9ff;
    color: #075985;
    font-weight: 700;
    line-height: 1.45;
  }

  .alert-success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }

  .alert-warning {
    border-color: #fde68a;
    background: #fffbeb;
    color: #92400e;
  }

  .alert-danger {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .soft-warning {
    margin-top: -0.35rem;
    font-weight: 600;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .side-card {
    position: sticky;
    top: 1rem;
  }

  .side-header {
    background: #1f2937;
  }

  .tips-list {
    display: grid;
    gap: 0.9rem;
    margin: 0;
    padding-left: 1.25rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .tips-list li::marker {
    color: #990c14;
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
    letter-spacing: 0.02em;
  }

  .footer-wrap p {
    margin: 0;
    color: #d1d5db;
    font-size: 0.95rem;
    font-weight: 600;
  }

  @media (min-width: 768px) {
    .col-md-6 {
      width: 50%;
    }
  }

  @media (min-width: 992px) {
    .col-lg-8 {
      width: 66.666667%;
    }

    .col-lg-4 {
      width: 33.333333%;
    }
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

    .publicar-main {
      width: min(96%, 700px);
    }

    .form-section,
    .card-body {
      padding: 0.85rem;
    }

    .preview-card {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .preview-card img {
      width: 100%;
      height: min(260px, 65vw);
    }

    .form-actions .btn {
      width: 100%;
    }

    .side-card {
      position: static;
    }
  }
</style>