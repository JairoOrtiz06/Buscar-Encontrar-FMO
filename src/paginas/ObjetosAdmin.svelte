<script lang="ts">
    let notificacion = "";
    let objetosPendientes = [
        {
            id: 1,
            nombre: "Calculadora Casio",
            categoria: "Calculadoras",
            ubicacion: "Biblioteca",
            fecha: "2026-06-10",
            foto: "/objeto.png",
            publicadoPor: "Juan Pérez",
            activo: true
        },
        {
            id: 2,
            nombre: "USB Kingston",
            categoria: "Memorias USB",
            ubicacion: "Edificio A",
            fecha: "2026-06-11",
            foto: "/objeto.png",
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
            mostrarNotificacion("📦 Publicación aprobada");
        }
    }

    function rechazarObjeto(id: number) {
        objetosPendientes = objetosPendientes.filter(o => o.id !== id);
        mostrarNotificacion("❌ Publicación rechazada");
    }

    function editarObjeto(objeto: any) {
        objetoEditando = { ...objeto };
    }

    function guardarEdicion() {
        objetosPendientes = objetosPendientes.map(o =>
            o.id === objetoEditando.id ? objetoEditando : o
        );
        mostrarNotificacion("✏️ Objeto editado");
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
        mostrarNotificacion("🚫 Objeto desactivado");
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

<h2>📌 Objetos Pendientes</h2>
{#each objetosPendientes.filter(o => o.activo) as objeto}
    <div class="card">
        <h3>{objeto.nombre}</h3>
        <p><strong>Categoría:</strong> {objeto.categoria}</p>
        <p><strong>Ubicación:</strong> {objeto.ubicacion}</p>
        <p><strong>Fecha:</strong> {objeto.fecha}</p>
        <p><strong>Publicado por:</strong> {objeto.publicadoPor}</p>

        <img src={objeto.foto} alt={objeto.nombre} class="foto-carnet">

        <div class="acciones">
            <button class="aprobar" on:click={() => aprobarObjeto(objeto.id)}>Aprobar</button>
            <button class="editar" on:click={() => editarObjeto(objeto)}>Editar</button>
            <button class="rechazar" on:click={() => rechazarObjeto(objeto.id)}>Rechazar</button>
            <button class="desactivar" on:click={() => desactivarObjeto(objeto.id)}>Desactivar</button>
        </div>
    </div>
{/each}

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

<h2>📚 Objetos Aprobados</h2>
{#each objetosAprobados.filter(o => o.activo) as objeto}
    <div class="card">
        <h3>{objeto.nombre}</h3>
        <p>{objeto.categoria}</p>
        <p>{objeto.ubicacion}</p>
        <button class="desactivar" on:click={() => desactivarObjeto(objeto.id)}>Desactivar</button>
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
    .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-content {
        background: #fff;
        padding: 1rem;
        border-radius: 8px;
        min-width: 300px;
    }
</style>
