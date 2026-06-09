<script>
    export let reclamarObjeto;

     import { onMount } from 'svelte';
     import { dbPromise } from '../base_datos/database.js';

    let busqueda = "";
    let categoria = "Todas";

    let objetos = [];

    
    async function cargarObjetos() {
        const db = await dbPromise;

        const tx = db.transaction('objetos', 'readonly');
        const store = tx.objectStore('objetos');

        objetos = await store.getAll();
    }
    

    
    onMount(() => {
        cargarObjetos();
    });
    

    $: objetosFiltrados = objetos.filter((objeto) => {
        const coincideNombre = objeto.nombre
            ?.toLowerCase()
            .includes(busqueda.toLowerCase());

        const coincideCategoria =
            categoria === "Todas" ||
            objeto.categoria === categoria;

        return coincideNombre && coincideCategoria;
    });
</script>

<h1>Buscar Objetos</h1>

<div class="filtros">
    <input
        type="text"
        placeholder="Buscar objeto..."
        bind:value={busqueda}
    />

    <select bind:value={categoria}>
        <option>Todas</option>
        <option>Carnés</option>
        <option>USB</option>
        <option>Calculadoras</option>
        <option>Mochilas</option>
        <option>Llaves</option>
        <option>Otros</option>
    </select>
</div>

{#if objetosFiltrados.length > 0}
    <div class="contenedor-objetos">
        {#each objetosFiltrados as objeto}
            <div class="card">

                <img
                    src={objeto.imagen}
                    alt={objeto.nombre}
                    class="imagen-objeto"
                />

                <h3>{objeto.nombre}</h3>

                <p>
                    <strong>Categoría:</strong>
                    {objeto.categoria}
                </p>

                <p>
                    <strong>Ubicación:</strong>
                    {objeto.ubicacion}
                </p>

                <p>
                    <strong>Fecha:</strong>
                    {objeto.fechaHallazgo}
                </p>

                <button on:click={() => reclamarObjeto(objeto)}>
                    Reclamar
                </button>

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
        width: 280px;
        background: #000000;
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
        height: 180px;
        object-fit: cover;
        display: block;
    }

    .card h3 {
        color: #4da6ff;
        margin: 15px 10px;
        font-size: 2rem;
    }

    .card p {
        margin: 10px 15px;
        font-size: 18px;
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
        transition: all 0.3s ease;
    }

    button:hover {
        background-color: #00cc30;
        transform: scale(1.05);
    }

    .mensaje {
        text-align: center;
        color: #ccc;
        font-size: 20px;
        margin-top: 30px;
    }
</style>