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
  $: usuarioIdActual = String($usuarioActual?.id ?? '');

  async function cargarObjetos() {
    const db = await dbPromise;

    const tx = db.transaction("objetos", "readonly");
    const store = tx.objectStore("objetos");

    objetos = await store.getAll();

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

    return coincideNombre && coincideCategoria;
  });
</script>

<main class="min-vh-100" style="background-color: #f1f3f5;">
  <Navbar paginaActual="buscar" />

  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">

        <div class="mb-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p class="text-uppercase fw-bold small mb-2" style="color: #990c14; letter-spacing: .12rem;">
                Universidad de El Salvador - FMO
              </p>

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
                  <option value="carnés">Carnés</option>
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
          <div class="row g-4">
            {#each objetosFiltrados as objeto}
              <div class="col-12 col-md-6 col-xl-4">
                <article class="card h-100 border-0 shadow-sm">
                  {#if objeto.foto}
                    <img
                      src={objeto.foto}
                      alt={objeto.titulo}
                      class="card-img-top object-fit-cover mb-3"
                      style="height: 220px; object-fit: cover; width: 100%; margin-bottom: 1rem;"
                    />
                  {:else}
                    <div
                      class="d-flex align-items-center justify-content-center bg-light text-secondary border-bottom"
                      style="height: 220px;"
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
                      <strong class="text-dark">Ubicación:</strong>
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
