<script lang="ts">
  export let reclamarObjeto;

  import { onMount } from "svelte";
  import { dbPromise } from "../base_datos/database.js";
  import { usuarioActual } from '../stores/authStore.js';
  import Navbar from '../componentes/Navbar.svelte';
  import Footer from '../componentes/Footer.svelte';

  let busqueda: string = "";
  let categoria: string = "Todas";
  let objetos: any[] = [];
  let usuarioIdActual: string = '';
  let imagenAmpliada: string | null = null;
  let tituloImagenAmpliada: string = '';
  $: usuarioIdActual = String($usuarioActual?.id ?? '');

  async function cargarObjetos() {
    const db = await dbPromise;
    const [objetosGuardados, usuarios] = await Promise.all([
      db.getAll("objetos"),
      db.getAll("usuarios")
    ]);

    const usuariosPorId = new Map(
      usuarios.map((usuario) => [String(usuario.id), usuario.nombre])
    );

    objetos = objetosGuardados.map((objeto) => ({
      ...objeto,
      publicadoPor: objeto.idUsuario != null
        ? usuariosPorId.get(String(objeto.idUsuario)) || "Usuario no disponible"
        : "Usuario no disponible"
    }));

    console.log("OBJETOS CARGADOS:", objetos);
  }

  onMount(() => {
    cargarObjetos();
  });

  $: objetosFiltrados = objetos.filter((objeto) => {
    const coincideNombre = (objeto.titulo || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "Todas" || objeto.categoria === categoria;

    const perteneceAlUsuarioActual =
      objeto.idUsuario != null && String(objeto.idUsuario) === usuarioIdActual;

    const estaDisponible = objeto.estado === "pendiente";

    return coincideNombre && coincideCategoria && !perteneceAlUsuarioActual && estaDisponible;
  });

  function abrirImagen(src: string, titulo: string) {
    imagenAmpliada = src;
    tituloImagenAmpliada = titulo;
  }

  function cerrarImagen() {
    imagenAmpliada = null;
    tituloImagenAmpliada = '';
  }
</script>

<main class="min-vh-100" style="background-color: #f1f3f5;">
  <Navbar paginaActual="buscar" />

  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">

        <div class="mb-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              
              <h1 class="fw-bold mb-2" style="color: #990c14;">
                Buscar Objetos
              </h1>

              <p class="text-secondary mb-0">
                Consulta los objetos perdidos y encontrados registrados en el sistema.
              </p>
            </div>

            <span class="badge rounded-pill px-4 py-3 text-white" style="background-color: #990c14;">
              {objetosFiltrados.length}
              {objetosFiltrados.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="row g-3 align-items-end">
              <div class="col-12 col-lg-8">
                <label for="busqueda" class="form-label fw-semibold text-dark">
                  Buscar por nombre
                </label>
                <input
                  id="busqueda"
                  type="text"
                  class="form-control form-control-lg shadow-sm"
                  placeholder="Ej. mochila, carnet, calculadora..."
                  bind:value={busqueda}
                />
              </div>

              <div class="col-12 col-lg-4">
                <label for="categoria" class="form-label fw-semibold text-dark">
                  Categoría
                </label>
                <select
                  id="categoria"
                  class="form-select form-select-lg shadow-sm"
                  bind:value={categoria}
                  aria-label="Seleccionar categoría"
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="carnet">Carnet</option>
                  <option value="memorias usb">Memorias USB</option>
                  <option value="calculadoras">Calculadoras</option>
                  <option value="cuadernos">Cuadernos</option>
                  <option value="mochilas">Mochilas</option>
                  <option value="llaves">Llaves</option>
                  <option value="cargadores">Cargadores</option>
                  <option value="teléfonos">Teléfonos</option>
                  <option value="documentos">Documentos</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {#if objetosFiltrados.length > 0}
          <div class="resultados-grid">
            {#each objetosFiltrados as objeto}
              <div>
                <article class="card resultado-card h-100 border-0 shadow-sm">
                  {#if objeto.foto}
                    <button
                      type="button"
                      class="imagen-btn"
                      aria-label={`Ver foto de ${objeto.titulo}`}
                      on:click={() => abrirImagen(objeto.foto, objeto.titulo)}
                    >
                      <img
                        src={objeto.foto}
                        alt={objeto.titulo}
                        class="card-img-top resultado-img object-fit-cover mb-3"
                      />
                    </button>
                  {:else}
                    <div
                      class="resultado-img d-flex align-items-center justify-content-center bg-light text-secondary border-bottom"
                    >
                      Sin imagen
                    </div>
                  {/if}

                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <h2 class="h5 fw-bold mb-0" style="color: #990c14;">
                        {objeto.titulo}
                      </h2>

                      <span class="badge text-white" style="background-color: #990c14;">
                        {objeto.estado}
                      </span>
                    </div>

                    <p class="mb-2 text-secondary">
                      <strong class="text-dark">Categoría:</strong>
                      {objeto.categoria}
                    </p>

                    <p class="mb-2 text-secondary">
                      <strong class="text-dark">Publicado por:</strong>
                      {objeto.publicadoPor}
                    </p>

                    <p class="mb-2 text-secondary">
                      <strong class="text-dark">Lugar encontrado:</strong>
                      {objeto.ubicacion}
                    </p>

                    <p class="mb-0 text-secondary">
                      <strong class="text-dark">Fecha:</strong>
                      {objeto.fechaPublicacion
                        ? new Date(objeto.fechaPublicacion).toLocaleDateString()
                        : "Sin fecha"}
                    </p>
                  </div>

                  <div class="card-footer bg-white border-0 px-4 pb-4 pt-0">
                    <button
                      class="btn text-white fw-bold w-100"
                      style="background-color: #990c14;"
                      on:click={() => reclamarObjeto(objeto)}
                      disabled={objeto.idUsuario != null && String(objeto.idUsuario) === String($usuarioActual?.id)}
                    >
                      {objeto.idUsuario != null && String(objeto.idUsuario) === String($usuarioActual?.id)
                        ? 'No puedes reclamar tu propio objeto'
                        : 'Reclamar objeto'}
                    </button>
                    {#if objeto.idUsuario != null && String(objeto.idUsuario) === String($usuarioActual?.id)}
                      <p class="text-danger small mt-2 mb-0">
                        No puedes reclamar un objeto que tú mismo publicaste.
                      </p>
                    {/if}
                  </div>
                </article>
              </div>
            {/each}
          </div>
        {:else}
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center p-5">
              <p class="text-uppercase fw-bold small mb-2" style="color: #990c14; letter-spacing: .1rem;">
                Sin resultados
              </p>

              <h2 class="h4 fw-bold mb-3" style="color: #990c14;">
                No se encontraron objetos
              </h2>

              <p class="text-secondary mb-0">
                Intenta cambiar el nombre de búsqueda o seleccionar otra categoría.
              </p>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </section>
  <Footer />
</main>

{#if imagenAmpliada}
  <div class="imagen-modal">
    <button type="button" class="imagen-backdrop" aria-label="Cerrar imagen" on:click={cerrarImagen}></button>
    <dialog open class="imagen-dialog" aria-label={`Foto de ${tituloImagenAmpliada}`}>
      <div class="imagen-modal-header">
        <h2>{tituloImagenAmpliada}</h2>
        <button type="button" class="cerrar-imagen" aria-label="Cerrar imagen" on:click={cerrarImagen}>x</button>
      </div>
      <img src={imagenAmpliada} alt={tituloImagenAmpliada} class="imagen-ampliada" />
    </dialog>
  </div>
{/if}

<style>
  .resultados-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }

  .resultado-card {
    overflow: hidden;
    border-radius: 14px;
  }

  .imagen-btn {
    width: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: zoom-in;
  }

  .imagen-btn:focus-visible {
    outline: 3px solid rgba(153, 12, 20, 0.35);
    outline-offset: -3px;
  }

  .resultado-img {
    width: 100%;
    height: 230px;
    object-fit: contain;
    background: #f8fafc;
    margin-bottom: 1rem;
  }

  .resultado-card :global(.card-body) {
    text-align: left;
  }

  .resultado-card :global(.card-body p) {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 0.35rem;
    align-items: start;
  }

  .imagen-modal {
    position: fixed;
    z-index: 1100;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .imagen-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.65);
  }

  .imagen-dialog {
    position: relative;
    z-index: 1;
    width: min(900px, 96vw);
    max-height: 92vh;
    border: 0;
    border-radius: 14px;
    padding: 1rem;
    background: #fff;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  }

  .imagen-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .imagen-modal-header h2 {
    margin: 0;
    color: #990c14;
    font-size: 1.1rem;
  }

  .cerrar-imagen {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 50%;
    background: #f3f4f6;
    color: #374151;
    font-weight: 900;
    cursor: pointer;
  }

  .imagen-ampliada {
    display: block;
    width: 100%;
    max-height: calc(92vh - 5rem);
    object-fit: contain;
    border-radius: 10px;
    background: #f8fafc;
  }

  @media (max-width: 992px) {
    .resultados-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .resultados-grid {
      grid-template-columns: 1fr;
    }

    .resultado-card :global(.card-body p) {
      grid-template-columns: 1fr;
    }
  }
</style>
