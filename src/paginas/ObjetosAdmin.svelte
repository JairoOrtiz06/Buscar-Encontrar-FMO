<script lang="ts">
    let notificacion = "";
    let objetosPendientes = [
        {
            id: 1,
            nombre: "Calculadora Casio",
            categoria: "Calculadoras",
            ubicacion: "Biblioteca",
            fecha: "2026-06-10",
            foto: "/svelte.svg",
            publicadoPor: "Juan Pérez",
            activo: true
        },
        {
            id: 2,
            nombre: "USB Kingston",
            categoria: "Memorias USB",
            ubicacion: "Edificio A",
            fecha: "2026-06-11",
            foto: "/carnet.jpeg",
            publicadoPor: "Ana Martínez",
            activo: true
        }
    ];

    let objetosAprobados: any[] = [];
    let objetoEditando: any = null;

    function aprobarObjeto(id: number) {
        const objeto = objetosPendientes.find(o => o.id === id);
        if (objeto) {
            objetosAprobados = [...objetosAprobados, objeto];
            objetosPendientes = objetosPendientes.filter(o => o.id !== id);
            mostrarNotificacion("Publicación aprobada");
        }
    }

    function rechazarObjeto(id: number) {
        objetosPendientes = objetosPendientes.filter(o => o.id !== id);
        mostrarNotificacion("Publicación rechazada");
    }

    function editarObjeto(objeto: any) {
        objetoEditando = { ...objeto };
    }

    function guardarEdicion() {
        objetosPendientes = objetosPendientes.map(o =>
            o.id === objetoEditando.id ? objetoEditando : o
        );
        mostrarNotificacion("Objeto editado");
        objetoEditando = null;
    }

    function cancelarEdicion() {
        objetoEditando = null;
    }

    function desactivarObjeto(id: number) {
        objetosPendientes = objetosPendientes.map(o =>
            o.id === id ? { ...o, activo: false } : o
        );
        objetosAprobados = objetosAprobados.map(o =>
            o.id === id ? { ...o, activo: false } : o
        );
        mostrarNotificacion("Objeto desactivado");
    }

    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;
        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }
</script>

{#if notificacion}
    <div class="notificacion">{notificacion}</div>
{/if}

<h2>Objetos Pendientes</h2>
<div class="contenedor-cards">
    {#each objetosPendientes.filter(o => o.activo) as objeto}
    <div class="card">
        <div class="contenido-card">

            <h3>{objeto.nombre}</h3>
            <p><strong>Categoría:</strong> {objeto.categoria}</p>
            <p><strong>Ubicación:</strong> {objeto.ubicacion}</p>
            <p><strong>Fecha:</strong> {objeto.fecha}</p>
            <p><strong>Publicado por:</strong> {objeto.publicadoPor}</p>

        </div>

        <img src={objeto.foto} alt={objeto.nombre} class="foto-carnet">

        <div class="acciones">
            <button class="aprobar" on:click={() => aprobarObjeto(objeto.id)}>Aprobar</button>
            <button class="editar" on:click={() => editarObjeto(objeto)}>Editar</button>
            <button class="rechazar" on:click={() => rechazarObjeto(objeto.id)}>Rechazar</button>
        </div>
    </div>
{/each}
</div>

{#if objetoEditando}
    <div class="modal-overlay" on:click={cancelarEdicion}>
        <div class="modal-content" on:click|stopPropagation>
            <h2>Editar Objeto</h2>
            <label>Nombre: <input bind:value={objetoEditando.nombre}></label>
            <label>Categoría: <input bind:value={objetoEditando.categoria}></label>
            <label>Ubicación: <input bind:value={objetoEditando.ubicacion}></label>
            <label>Fecha: <input type="date" bind:value={objetoEditando.fecha}></label>
            <div class="acciones">
                <button on:click={guardarEdicion}>Guardar</button>
                <button on:click={cancelarEdicion}>Cancelar</button>
            </div>
        </div>
    </div>
{/if}

<h2> Objetos Aprobados</h2>
{#each objetosAprobados.filter(o => o.activo) as objeto}
    <div class="contenedor-cards">
        <div class="card">
        <div class="contenido-card">

            <h3>{objeto.nombre}</h3>
            <p><strong>Categoría:</strong> {objeto.categoria}</p>
            <p><strong>Ubicación:</strong> {objeto.ubicacion}</p>
            <p><strong>Fecha:</strong> {objeto.fecha}</p>
            <p><strong>Publicado por:</strong> {objeto.publicadoPor}</p>

        </div>

        <img src={objeto.foto} alt={objeto.nombre} class="foto-carnet">
    </div>
    </div>
    
{/each}

<style>
    .notificacion {
        background: #4caf50;
        color: white;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        text-align: center;
        animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  .contenedor-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,.08);
    border-top: 5px solid #b30000;
    transition: .3s;
    width: 420px;
}

.card:hover {
    transform: translateY(-6px);
    box-shadow: 0 15px 35px rgba(0,0,0,.15);
}
.foto-carnet {
    width: 80%;
    height: 220px;
    object-fit: cover;
    border-radius: 1rem;
}
.contenido-card {
    padding: 1rem;
}

.contenido-card h3 {
    color: #b30000;
    margin-bottom: 1rem;
}

.contenido-card p {
    margin: .5rem 0;
    color: #475569;
}
.acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    padding: 1rem;
}
.aprobar {
    background: #16a34a;
    color: white;
}

.editar {
    background: #2563eb;
    color: white;
}

.rechazar {
    background: #dc2626;
    color: white;
}

.acciones button {
    flex: 1;
    min-width: 100px;

    border: none;
    border-radius: 10px;

    padding: 10px;

    cursor: pointer;

    transition: .3s;
}
.acciones button:hover {
    transform: translateY(-2px);
}
.modal-content {
    background: white;
    width: 90%;
    max-width: 500px;
    padding: 2rem;
    border-radius: 16px;
}
.modal-content label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
}
.modal-content input {
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    margin-top: 5px;
}
h2 {
    color: #b30000;
    margin: 2rem 0 1rem;
    text-align: center;
}
</style>
