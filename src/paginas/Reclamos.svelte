<script lang="ts">
    import { onMount } from 'svelte';
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
    let misReclamos: any[] = [];
    let cargandoReclamos = true;
    $: formularioIncompleto = !motivo.trim() || !descripcion.trim() || !contacto.trim();

    onMount(async () => {
        await cargarMisReclamos();
    });

    async function cargarMisReclamos() {
        cargandoReclamos = true;

        try {
            if (!$usuarioActual?.id) {
                misReclamos = [];
                return;
            }

            const db = await dbPromise;
            const reclamos = await db.getAll('reclamos');
            const reclamosUsuario = reclamos.filter((reclamo) =>
                String(reclamo.idSolicitante) === usuarioIdActual
            );

            misReclamos = await Promise.all(
                reclamosUsuario.map(async (reclamo) => ({
                    ...reclamo,
                    objeto: await db.get('objetos', reclamo.idObjeto)
                }))
            );

            misReclamos = misReclamos.sort(
                (a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
            );
        } catch (error) {
            console.error('Error cargando reclamos del usuario:', error);
            misReclamos = [];
        } finally {
            cargandoReclamos = false;
        }
    }

    function formatearFecha(fecha: string) {
        if (!fecha) return 'Sin fecha';
        return new Date(fecha).toLocaleDateString();
    }

    function getEstadoColor(estado: string) {
        switch (estado) {
            case 'aprobado':
                return '#15803d';
            case 'rechazado':
                return '#b91c1c';
            default:
                return '#a16207';
        }
    }

    function getMensajeEstado(estado: string) {
        switch (estado) {
            case 'aprobado':
                return 'Tu reclamo fue aprobado. Acercate a administracion para continuar el proceso.';
            case 'rechazado':
                return 'Tu reclamo fue rechazado por administracion.';
            default:
                return 'Tu reclamo esta pendiente de revision.';
        }
    }

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

        if (!$usuarioActual?.id) {
            alert('Debes iniciar sesion para enviar un reclamo.');
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
            const reclamos = await db.getAll('reclamos');
            const reclamoExistente = reclamos.find((reclamo) =>
                reclamo.idObjeto === objeto?.id &&
                String(reclamo.idSolicitante) === usuarioIdActual &&
                ['pendiente', 'aprobado'].includes(reclamo.estado)
            );

            if (reclamoExistente) {
                alert('Ya tienes un reclamo pendiente o aprobado para este objeto.');
                return;
            }

            await db.add('reclamos', {
                idObjeto: objeto.id,
                idSolicitante: $usuarioActual.id,
                motivo: motivo.trim(),
                descripcion: descripcion.trim(),
                contacto: contacto.trim(),
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
            {objeto && objeto.id != null ? 'Solicitar Reclamo' : 'Mis reclamos'}
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

                  <div class="mb-4">
                    <label for="contacto" class="form-label fw-semibold text-dark">
                      Medio de contacto
                    </label>
                    <input
                      id="contacto"
                      type="text"
                      class="form-control form-control-lg"
                      class:is-invalid={contactoError}
                      bind:value={contacto}
                      placeholder="Telefono o correo electronico"
                      on:blur={() => {
                        contactoError = contacto.trim()
                          ? validarContacto(contacto.trim())
                            ? ""
                            : "Ingresa un correo o telefono valido."
                          : "Indica un medio de contacto.";
                      }}
                    />
                    {#if contactoError}
                      <div class="invalid-feedback d-block">{contactoError}</div>
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
                      disabled={formularioIncompleto || esPropietario || !$usuarioActual?.id}
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
                <div class="p-4 p-lg-5">
                  <h2 class="h4 fw-bold mb-3" style="color: #990c14;">
                    Mis reclamos enviados
                  </h2>
                  <p class="text-secondary mb-4">
                    Aqui puedes revisar si tus solicitudes estan pendientes, aprobadas o rechazadas.
                  </p>
                  {#if cargandoReclamos}
                    <div class="alert alert-light border mb-4">
                      Cargando tus reclamos...
                    </div>
                  {:else if misReclamos.length === 0}
                    <div class="alert alert-light border mb-4">
                      Aun no has enviado reclamos.
                    </div>
                  {:else}
                    <div class="d-flex flex-column gap-3 mb-4 text-start">
                      {#each misReclamos as reclamo}
                        <article class="border rounded p-3 p-md-4 bg-white shadow-sm">
                          <div class="row g-3 align-items-center">
                            <div class="col-12 col-md-3">
                              {#if reclamo.objeto?.foto}
                                <img
                                  src={reclamo.objeto.foto}
                                  alt={reclamo.objeto.titulo}
                                  class="img-fluid rounded w-100 object-fit-cover"
                                  style="max-height: 150px;"
                                />
                              {:else}
                                <div
                                  class="border rounded bg-light d-flex align-items-center justify-content-center text-secondary"
                                  style="height: 130px;"
                                >
                                  Sin imagen
                                </div>
                              {/if}
                            </div>

                            <div class="col-12 col-md-9">
                              <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                                <div>
                                  <p class="text-uppercase text-secondary small fw-bold mb-1">
                                    {reclamo.objeto?.categoria || 'Sin categoria'}
                                  </p>
                                  <h3 class="h5 fw-bold mb-0" style="color: #990c14;">
                                    {reclamo.objeto?.titulo || 'Objeto no disponible'}
                                  </h3>
                                </div>

                                <span
                                  class="badge text-white align-self-md-start px-3 py-2"
                                  style={`background-color: ${getEstadoColor(reclamo.estado)};`}
                                >
                                  {reclamo.estado}
                                </span>
                              </div>

                              <p class="text-secondary mb-2">
                                <strong class="text-dark">Fecha:</strong>
                                {formatearFecha(reclamo.fechaSolicitud)}
                              </p>

                              <p class="text-secondary mb-2">
                                <strong class="text-dark">Motivo:</strong>
                                {reclamo.motivo}
                              </p>

                              <div class="alert alert-light border mb-0">
                                {getMensajeEstado(reclamo.estado)}
                              </div>
                            </div>
                          </div>
                        </article>
                      {/each}
                    </div>
                  {/if}
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



