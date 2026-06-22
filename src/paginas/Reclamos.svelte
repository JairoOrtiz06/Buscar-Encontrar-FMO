<script lang="ts">
    import { dbPromise } from '../base_datos/database.js';
    import { usuarioActual } from '../stores/authStore.js';
    import Navbar from '../componentes/Navbar.svelte';
    import Footer from '../componentes/Footer.svelte';

    type ObjetoReclamable = {
        id: number | null;
        titulo: string;
        categoria: string;
        ubicacion: string;
        fechaPublicacion: string;
        foto: string;
        idUsuario: string | number | null;
    };

    export let objeto: ObjetoReclamable | null = {
        id: null,
        titulo: "",
        categoria: "",
        ubicacion: "",
        fechaPublicacion: "",
        foto: "",
        idUsuario: null
    };

    let usuarioIdActual: string = '';
    $: usuarioIdActual = String($usuarioActual?.id ?? '');
    $: esPropietario = objeto?.idUsuario != null && String(objeto.idUsuario) === usuarioIdActual;

    export let volver: () => void = () => {};

    let motivo = "";
    let descripcion = "";
    let contacto = "";
    let motivoError = "";
    let descripcionError = "";
    let contactoError = "";

    function validarContacto(valor: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9()+\s\-]{6,20}$/;
        return emailRegex.test(valor) || phoneRegex.test(valor);
    }

    function validarReclamo() {
        motivoError = motivo.trim() ? "" : "Escribe el motivo del reclamo.";
        descripcionError = descripcion.trim() ? "" : "Describe el objeto o la razón del reclamo.";
        contactoError = contacto.trim()
            ? validarContacto(contacto.trim())
                ? ""
                : "Ingresa un correo o teléfono válido."
            : "Indica un medio de contacto.";

        return !motivoError && !descripcionError && !contactoError;
    }

    async function enviarReclamo() {
        if (!objeto || objeto.id == null) {
            alert('Debes seleccionar un objeto antes de enviar el reclamo.');
            return;
        }

        if (esPropietario) {
            alert('No puedes reclamar un objeto que tú mismo publicaste.');
            return;
        }

        if (!validarReclamo()) {
            return;
        }

        try {
            const db = await dbPromise;

            await db.add('reclamos', {
                idObjeto: objeto.id,
                idSolicitante: usuarioIdActual,
                motivo,
                descripcion,
                contacto,
                estado: 'pendiente',
                fechaSolicitud: new Date().toISOString()
            });

            alert("Reclamo enviado correctamente");

            motivo = "";
            descripcion = "";
            contacto = "";

            volver();

        } catch (error) {
            console.error(error);
            alert("Error al guardar el reclamo");
        }
    }
</script>

<Navbar paginaActual="reclamos" />

<main class="min-vh-100" style="background-color: #f1f3f5;">
  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">

        <div class="text-center mb-5">
          <p class="text-uppercase fw-bold small mb-2" style="color: #990c14; letter-spacing: .14rem;">
            Universidad de El Salvador - FMO
          </p>

          <h1 class="fw-bold mb-3" style="color: #990c14;">
            Solicitar Reclamo
          </h1>

          <p class="text-secondary mb-0">
            Completa la información requerida para iniciar la verificación del objeto.
          </p>
        </div>

        <div class="card border-0 shadow-sm overflow-hidden">
          <div class="row g-0">
            {#if objeto && objeto.id != null}
              <div class="col-12 col-lg-5 bg-light border-end">
                <div class="p-4 p-lg-5 h-100">
                  <p class="text-uppercase fw-bold small mb-3" style="color: #990c14; letter-spacing: .1rem;">
                    Objeto seleccionado
                  </p>

                  {#if objeto.foto}
                    <img
                      src={objeto.foto}
                      alt={objeto.titulo}
                      class="img-fluid rounded shadow-sm mb-4 w-100 object-fit-cover"
                      style="max-height: 280px;"
                    />
                  {:else}
                    <div
                      class="border rounded bg-white d-flex align-items-center justify-content-center text-secondary mb-4"
                      style="height: 240px;"
                    >
                      Sin imagen disponible
                    </div>
                  {/if}

                  <h2 class="h4 fw-bold mb-4" style="color: #990c14;">
                    {objeto.titulo || "Objeto sin título"}
                  </h2>

                  <div class="d-flex flex-column gap-3">
                    <div>
                      <p class="text-uppercase text-secondary small fw-bold mb-1">
                        Categoría
                      </p>
                      <p class="mb-0 text-dark">
                        {objeto.categoria || "No especificada"}
                      </p>
                    </div>

                    <div>
                      <p class="text-uppercase text-secondary small fw-bold mb-1">
                        Ubicación
                      </p>
                      <p class="mb-0 text-dark">
                        {objeto.ubicacion || "No especificada"}
                      </p>
                    </div>

                    <div>
                      <p class="text-uppercase text-secondary small fw-bold mb-1">
                        Fecha de publicación
                      </p>
                      <p class="mb-0 text-dark">
                        {objeto.fechaPublicacion
                          ? new Date(objeto.fechaPublicacion).toLocaleDateString()
                          : "Sin fecha"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-lg-7">
                <div class="p-4 p-lg-5">
                  <p class="text-uppercase fw-bold small mb-2" style="color: #990c14; letter-spacing: .1rem;">
                    Formulario de reclamo
                  </p>

                  <h2 class="h3 fw-bold mb-2" style="color: #990c14;">
                    Verificación de propiedad
                  </h2>

                  <p class="text-secondary mb-4">
                    Proporciona información clara para que administración pueda revisar tu solicitud.
                  </p>

                  <div class="mb-3">
                    <label for="motivo" class="form-label fw-semibold text-dark">
                      Motivo del reclamo
                    </label>
                    <input
                      id="motivo"
                      type="text"
                      class="form-control form-control-lg"
                      class:is-invalid={motivoError}
                      bind:value={motivo}
                      placeholder="Ej. El objeto me pertenece"
                      on:blur={() => { motivoError = motivo.trim() ? "" : "Escribe el motivo del reclamo."; }}
                    />
                    {#if motivoError}
                      <div class="invalid-feedback d-block">{motivoError}</div>
                    {/if}
                  </div>

                  <div class="mb-3">
                    <label for="descripcion" class="form-label fw-semibold text-dark">
                      Descripción del objeto
                    </label>
                    <textarea
                      id="descripcion"
                      class="form-control"
                      class:is-invalid={descripcionError}
                      rows="5"
                      bind:value={descripcion}
                      on:blur={() => { descripcionError = descripcion.trim() ? "" : "Describe el objeto o la razón del reclamo."; }}
                    ></textarea>
                    {#if descripcionError}
                      <div class="invalid-feedback d-block">{descripcionError}</div>
                    {/if}
                  </div>

        
                  {#if esPropietario}
                    <div class="alert alert-danger mt-3">
                      No puedes reclamar un objeto que tú mismo publicaste.
                    </div>
                  {/if}

                  <div class="d-grid">
                    <button
                      class="btn text-white fw-bold py-3"
                      style="background-color: #990c14;"
                      on:click={enviarReclamo}
                      disabled={!motivo || !descripcion || !contacto || esPropietario}
                    >
                      Enviar solicitud de reclamo
                    </button>
                  </div>

                  <div class="alert alert-light border mt-4 mb-0">
                    <strong style="color: #990c14;">Importante:</strong>
                    Tu reclamo quedará pendiente hasta que administración revise la información proporcionada.
                  </div>
                </div>
              </div>
            {:else}
              <div class="col-12">
                <div class="p-4 p-lg-5 text-center">
                  <h2 class="h4 fw-bold mb-3" style="color: #990c14;">
                    Selecciona un objeto antes de reclamar
                  </h2>
                  <p class="text-secondary mb-4">
                    Primero ve a Buscar Objeto y elige el objeto que quieres reclamar. Luego usa el botón "Reclamar objeto".
                  </p>
                  <button
                    class="btn btn-outline-danger px-4 py-3"
                    on:click={volver}
                  >
                    Ir a Buscar Objetos
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>

      </div>
    </div>
  </section>

  <Footer />
</main>



