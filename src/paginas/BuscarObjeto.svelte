<script lang="ts">
  export let reclamarObjeto;

  import { onMount } from "svelte";
  import { dbPromise } from "../base_datos/database.js";

  let busqueda = "";
  let categoria = "Todas";
  let objetos: any[] = [];

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
<div class="debug"></div>
<h1>Buscar Objetos</h1>

<div class="filtros">
  <input type="text" placeholder="Buscar objeto..." bind:value={busqueda} />

  <select bind:value={categoria}>
    <option>Todas</option>
    <option>carnés</option>
    <option>memorias usb</option>
    <option>calculadoras</option>
    <option>cuadernos</option>
    <option>mochilas</option>
    <option>llaves</option>
    <option>cargadores</option>
    <option>teléfonos</option>
    <option>documentos</option>
    <option>otros</option>
  </select>
</div>

{#if objetosFiltrados.length > 0}
  <div class="contenedor-objetos">
    {#each objetosFiltrados as objeto}
      <div class="card">
        {#if objeto.foto}
          <img src={objeto.foto} alt={objeto.titulo} class="imagen-objeto" />
        {/if}

        <h3>{objeto.titulo}</h3>

        <p>
          <strong>Categoría:</strong>
          {objeto.categoria}
        </p>

        <p>
          <strong>Ubicación:</strong>
          {objeto.ubicacion}
        </p>

        <p>
          <strong>Estado:</strong>
          {objeto.estado}
        </p>

        <p>
          <strong>Fecha:</strong>
          {objeto.fechaPublicacion
            ? new Date(objeto.fechaPublicacion).toLocaleDateString()
            : ""}
        </p>

        <button on:click={() => reclamarObjeto(objeto)}> Reclamar </button>
      </div>
    {/each}
  </div>
{:else}
  <p class="mensaje">No hay objetos registrados.</p>
{/if}

<style>
  h1 {
    text-align: center;
    color: white;
    font-size: 2.5rem;
    margin-bottom: 25px;
  }

  .filtros {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  input,
  select {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  input {
    width: 260px;
  }

  .contenedor-objetos {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 25px;
  }

  .card {
    width: 300px;
    background: #000;
    border: 1px solid #2d2d44;
    border-radius: 15px;
    overflow: hidden;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
    padding-bottom: 20px;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .imagen-objeto {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  .card h3 {
    color: #4da6ff;
    margin: 15px 10px;
    font-size: 1.8rem;
  }

  .card p {
    margin: 10px 15px;
    font-size: 16px;
  }
  

  button {
    margin-top: 15px;
    padding: 10px 25px;
    border: none;
    border-radius: 8px;
    background-color: #00ff3c;
    color: black;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  button:hover {
    background-color: #00cc30;
  }

  .mensaje {
    text-align: center;
    color: #ccc;
    font-size: 20px;
    margin-top: 30px;
  }
</style>
