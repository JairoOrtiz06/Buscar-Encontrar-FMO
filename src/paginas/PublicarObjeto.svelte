<script>
  import { crearObjeto, verificarDuplicado } from '../crud/objetos.js';
  import Navbar from '../componentes/Navbar.svelte';
  import Footer from '../componentes/Footer.svelte';
  import { usuarioActual } from '../stores/authStore.js';
  import { irA } from '../stores/navegacionStore.js';
  import { enviarNotificacionAdmins } from '../servicios/notificacionesService.js';

  const categorias = [
    { valor: 'carnet', label: 'Carnet' },
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

  let titulo = '';
  let descripcion = '';
  let categoria = 'otros';
  let ubicacion = '';
  let foto = null;
  let vistaPrevia = null;
  let guardando = false;
  let mensaje = '';
  let duplicadoDetectado = false;

  function procesarImagen(evento) {
    const archivo = evento.target.files[0];
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
    if (!$usuarioActual?.id) {
      mensaje = 'Debes iniciar sesion para publicar un objeto';
      return;
    }

    if (!titulo.trim() || !categoria || !ubicacion.trim()) {
      mensaje = 'Completa todos los campos';
      return;
    }

    mensaje = '';
    duplicadoDetectado = false;

    const verificacion = await buscarDuplicados();

    if (verificacion.duplicado) {
      duplicadoDetectado = true;
      mensaje = 'Ya existe un objeto con informacion similar. No se puede duplicar.';
      return;
    }

    guardando = true;

    try {
      let imagenBase64 = null;
      if (foto) {
        imagenBase64 = await convertirImagenABase64(foto);
      }

      const objeto = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria,
        ubicacion: ubicacion.trim(),
        foto: imagenBase64,
        idUsuario: $usuarioActual.id
      };

      const idObjeto = await crearObjeto(objeto);

      await enviarNotificacionAdmins({
        titulo: 'Objeto publicado',
        mensaje: `${$usuarioActual?.nombre || 'Un usuario'} publico el objeto "${objeto.titulo}".`,
        tipo: 'objeto-publicado',
        referencia: { idObjeto, idUsuario: $usuarioActual.id }
      });

      mensaje = 'Objeto publicado correctamente';

      setTimeout(() => irA('inicio'), 1500);
    } catch (error) {
      console.error(error);

      if (error.message === 'DUPLICADO') {
        duplicadoDetectado = true;
        mensaje = 'Ya existe un objeto con informacion similar. No se puede duplicar.';
      } else {
        mensaje = 'Error al guardar el objeto';
      }
    } finally {
      guardando = false;
    }
  }

  function quitarImagen() {
    foto = null;
    vistaPrevia = null;
  }

  $: tipoMensaje = duplicadoDetectado
    ? 'warning'
    : mensaje.includes('correctamente')
      ? 'success'
      : mensaje.includes('Error') || mensaje.includes('Debes') || mensaje.includes('Completa')
        ? 'danger'
        : 'info';
</script>

<main class="min-vh-100 d-flex flex-column bg-light">
  <Navbar paginaActual="publicar" />

  <section class="flex-grow-1 py-4 py-lg-5">
    <div class="container">
      <div class="row g-3 g-lg-4">
        <div class="col-12 col-lg-8">
          <article class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header text-white p-3" style="background-color: #990c14;">
              <h1 class="h4 fw-bold mb-1">Publicar Objeto</h1>
              <p class="small text-white-50 mb-0">Completa los datos para registrar un hallazgo.</p>
            </div>

            <div class="card-body p-3 p-md-4">
              <form class="vstack gap-3" on:submit|preventDefault={guardarObjeto}>
                <div class="alert bg-white fw-semibold mb-0" style="border-color: #990c14;">
                  Publicaras como: <strong>{$usuarioActual?.nombre || 'Usuario actual'}</strong>
                </div>

                <section class="border rounded-3 bg-body-tertiary p-3">
                  <h2 class="h6 fw-bold mb-3">Datos principales</h2>

                  <div class="mb-3">
                    <label for="titulo" class="form-label fw-semibold">
                      Titulo <span style="color: #990c14;">*</span>
                    </label>
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

                  <div>
                    <label for="descripcion" class="form-label fw-semibold">Descripcion</label>
                    <textarea
                      id="descripcion"
                      class="form-control"
                      bind:value={descripcion}
                      placeholder="Describe el objeto..."
                      rows="4"
                    ></textarea>
                  </div>
                </section>

                <section class="border rounded-3 bg-body-tertiary p-3">
                  <h2 class="h6 fw-bold mb-3">Clasificacion y ubicacion</h2>

                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="categoria" class="form-label fw-semibold">
                        Categoria <span style="color: #990c14;">*</span>
                      </label>
                      <select id="categoria" class="form-select" bind:value={categoria} required>
                        {#each categorias as cat}
                          <option value={cat.valor}>{cat.label}</option>
                        {/each}
                      </select>
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="ubicacion" class="form-label fw-semibold">
                        Ubicacion donde lo encontraste <span style="color: #990c14;">*</span>
                      </label>
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
                </section>

                <section class="border rounded-3 bg-body-tertiary p-3">
                  <h2 class="h6 fw-bold mb-3">Imagen y vista previa</h2>

                  <label for="foto" class="form-label fw-semibold">Foto del objeto</label>
                  <input id="foto" class="form-control" type="file" accept="image/*" on:change={procesarImagen} />
                  <div class="form-text">Formatos imagen. Tamano maximo: 5MB.</div>

                  {#if vistaPrevia}
                    <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 border rounded-3 bg-white p-3 mt-3">
                      <img
                        src={vistaPrevia}
                        alt="Vista previa del objeto"
                        class="img-thumbnail object-fit-cover"
                        width="112"
                        height="112"
                      />
                      <button type="button" class="btn btn-outline-danger btn-sm align-self-start" on:click={quitarImagen}>
                        Quitar imagen
                      </button>
                    </div>
                  {/if}
                </section>

                {#if mensaje}
                  <div
                    class="alert fw-semibold mb-0"
                    class:alert-success={tipoMensaje === 'success'}
                    class:alert-warning={tipoMensaje === 'warning'}
                    class:alert-danger={tipoMensaje === 'danger'}
                    class:alert-info={tipoMensaje === 'info'}
                  >
                    {mensaje}
                  </div>
                {/if}

                {#if duplicadoDetectado}
                  <div class="alert alert-warning fw-semibold mb-0">
                    El objeto ya existe con el mismo titulo, categoria y ubicacion. Si crees que es diferente,
                    modifica algun campo.
                  </div>
                {/if}

                <div class="d-grid d-md-flex justify-content-md-end">
                  <button type="submit" class="btn btn-lg fw-bold px-4 text-white" style="background-color: #990c14; border-color: #990c14;" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </article>
        </div>

        <aside class="col-12 col-lg-4">
          <article class="card border-0 shadow-sm sticky-lg-top">
            <div class="card-header text-bg-dark p-3">
              <h3 class="h5 fw-bold mb-0">Recomendaciones</h3>
            </div>
            <div class="card-body p-3 p-md-4">
              <ul class="vstack gap-3 text-secondary mb-0">
                <li>Usa un titulo claro y especifico.</li>
                <li>Indica una ubicacion lo mas precisa posible.</li>
                <li>Sube una imagen nitida para facilitar la identificacion.</li>
                <li>Evita duplicados revisando la informacion antes de publicar.</li>
              </ul>
            </div>
          </article>
        </aside>
      </div>
    </div>
  </section>

  <Footer />
</main>
