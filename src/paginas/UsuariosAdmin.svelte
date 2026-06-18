<script lang="ts">
    let pestaña = "usuarios";

    import { dbPromise } from '../base_datos/database.js';
    import { onMount } from 'svelte';

    let usuarios: any[] = [];

    onMount(async () => {
        const db = await dbPromise;
        usuarios = await db.getAll('usuarios');
    });
    let mostrarEditar = false;
    let usuarioEditando: any = null;

    let busqueda = "";

    let imagenSeleccionada = "";
    let notificacion = "";

   async function aprobarUsuario(id:number) {

    const db = await dbPromise;

    const usuario = usuarios.find(
        u => u.id === id
    );

    if (!usuario) return;

    usuario.validado = true;
    usuario.estado = 'aprobado';

    await db.put('usuarios', usuario);

    usuarios = await db.getAll('usuarios');

    mostrarNotificacion(
        '✅ Usuario aprobado'
    );
    }

    async function rechazarUsuario(id:number) {

        const db = await dbPromise;

        const usuario = usuarios.find(
            u => u.id === id
        );

        if (!usuario) return;

        usuario.estado = 'rechazado';

        await db.put('usuarios', usuario);

        usuarios = await db.getAll('usuarios');

        mostrarNotificacion(
            '❌ Usuario rechazado'
        );
    }

    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;

        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }

   async function desactivarUsuario(id:number) {

        const db = await dbPromise;

        const usuario = usuarios.find(
            u => u.id === id
        );

        if (!usuario) return;

        usuario.estado =
            usuario.estado === 'Activo'
                ? 'Inactivo'
                : 'Activo';

        await db.put('usuarios', usuario);

        usuarios = await db.getAll('usuarios');

        mostrarNotificacion(
            '🔄 Estado actualizado'
        );
    }

    function editarUsuario(usuario: any) {
    usuarioEditando = { ...usuario };
    mostrarEditar = true;}

    async function guardarEdicion() {

        const db = await dbPromise;

        await db.put('usuarios', usuarioEditando);

        usuarios = await db.getAll('usuarios');

        mostrarEditar = false;

        mostrarNotificacion(
            "✏️ Usuario actualizado"
        );
    }
</script>


<!-- Notificación flotante -->
{#if notificacion}
    <div class="notificacion">{notificacion}</div>
{/if}


<h2>Aprobar Registros</h2>

<div class="contenedor-cards">
    {#each usuarios as usuario}
    <div class="card">
        <h3>{usuario.nombre}</h3>
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Carnet:</strong> {usuario.carnet}</p>

        <img
            src={usuario.fotoCarnet}
            alt="Carnet"
            width="120"
            on:click={() => imagenSeleccionada = usuario.fotoCarnet}
        />

        <br>
        <button on:click={() => aprobarUsuario(usuario.id)}>Aprobar</button>
        <button on:click={() => mostrarNotificacion("ℹ️ Observación registrada")}>Observación</button>
        <button on:click={() => rechazarUsuario(usuario.id)}>Rechazar</button>
    </div>
{/each}
</div>

{#if imagenSeleccionada}
    <div class="modal-overlay" role="button" tabindex="0"
        on:click={() => imagenSeleccionada = ""}
        on:keydown={(e) => e.key === "Enter" || e.key === " " ? imagenSeleccionada = "" : null}>
        <div class="modal-content" on:click|stopPropagation>
            <button class="close" on:click={() => imagenSeleccionada = ""}>✖</button>
            <img src={imagenSeleccionada} alt="Seleccionada" />
        </div>
    </div>
{/if}

{#if mostrarEditar}

<div class="modal-overlay">

   <div class="modal-content">

    <h2>Editar Usuario</h2>

    <div class="campo">
        <label>Nombre</label>
        <input bind:value={usuarioEditando.nombre}>
    </div>

    <div class="campo">
        <label>Correo</label>
        <input bind:value={usuarioEditando.correo}>
    </div>

    <div class="campo">
        <label>Carnet</label>
        <input bind:value={usuarioEditando.carnet}>
    </div>

    <div class="acciones">

        <button
            class="aprobar"
            on:click={guardarEdicion}>
            Guardar
        </button>

        <button
            class="rechazar"
            on:click={() => mostrarEditar = false}>
            Cancelar
        </button>

    </div>

</div>

</div>

{/if}

<hr>


<h2>Usuarios Registrados</h2>

<div class="contenedor-buscador">

    <input
        type="text"
        bind:value={busqueda}
        placeholder="🔍 Buscar usuario..."
        class="buscador"
    />

</div>
<table class="tabla-usuarios">

    <thead>
        <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Carnet</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
    </thead>

    <tbody>

        {#each usuarios.filter(
            usuario =>
                usuario.nombre
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
        ) as usuario}

        <tr>

            <td>{usuario.nombre}</td>

            <td>{usuario.correo}</td>

            <td>{usuario.carnet}</td>

            <td>

                <span
                    class={usuario.estado === "Activo"
                        ? "activo"
                        : "inactivo"}>

                    {usuario.estado}

                </span>

            </td>

            <td>

                <div class="acciones-tabla">

                    <button
                        class="observacion"
                        on:click={() =>
                            desactivarUsuario(usuario.id)}
                    >
                        {usuario.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                    </button>

                    <button
                        class="editar"
                        on:click={() =>
                            editarUsuario(usuario)}
                    >
                        Editar
                    </button>

                    

                </div>

            </td>

        </tr>

        {/each}

    </tbody>

</table>
<footer class="footer">

    <p>
        © 2026 Encuentra UES-FMO
    </p>

    <p>
        Sistema de Gestión de Objetos Perdidos y Encontrados
    </p>

    <p>
        Universidad de El Salvador - Facultad Multidisciplinaria Oriental
    </p>

</footer>


<style>
    /* Estilo general */
    
:global(body) {
    background: #f1f5f9;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
}

/* Tarjetas */
.card {
    background: white;
    border-radius: 18px;
    padding: 1.5rem;
    border-left: 6px solid #b91c1c;
    box-shadow: 0 8px 25px rgba(0,0,0,.08);
    transition: .3s;
}
.card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}
.card img {
    width: 100%;
    max-height: 180px;
    object-fit: cover;
    border-radius: 12px;
    margin: 12px 0;
    cursor: pointer;
    transition: transform 0.3s;
}
.card img:hover { transform: scale(1.03); }

/* Contenedor de tarjetas */
.contenedor-cards {
    display: grid;
    grid-template-columns: repeat(
        auto-fit,
        minmax(200px, 1fr)
    );
    gap: 1rem;
}
/* Títulos */
h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #b91c1c;
    font-size: clamp(1.4rem, 2.5vw, 2rem);
}
h3 {
    color: #991b1b;
    margin-bottom: .8rem;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
}

/* Botones */
button {
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
button:hover { transform: translateY(-2px); }
.acciones, .acciones-tabla {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 1rem;
}

/* Colores de acción */
.aprobar { background: #b91c1c; color: white; }
.aprobar:hover { background: #991b1b; }
.rechazar { background: #ef4444; color: white; }
.observacion { background: #f59e0b; color: white; }
.editar { background: #3b82f6; color: white; }

/* Estado */
.activo, .inactivo {
    padding: 5px 12px;
    border-radius: 999px;
    font-size: .85rem;
}
.activo { background: #dcfce7; color: #15803d; }
.inactivo { background: #fee2e2; color: #b91c1c; }

/* Buscador */
.buscador {
    width: 100%;
    max-width: 500px;
    margin: 0 auto 2rem auto;
    display: block;
    padding: 14px 18px;
    border-radius: 14px;
    border: 2px solid transparent;
    background: white;
    box-shadow: 0 4px 10px rgba(0,0,0,.05);
}
.buscador:focus {
    border-color: #b91c1c;
    outline: none;
}

/* Notificación flotante */
.notificacion {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #b91c1c;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: fadeInOut 3s forwards;
    z-index: 2000;
}
.buscador {
    color: black;
    width: 100%;
    max-width: 550px;
    padding: 14px 20px;
    border-radius: 999px;
    border: 2px solid #e5e7eb;
    background: white;
    box-shadow:
        0 4px 12px rgba(0,0,0,.06);

    box-sizing: border-box;
}
/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.modal-content {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    position: relative;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    animation: fadeIn 0.3s ease;
}
.modal-content img { max-width: 100%; border-radius: 8px; }
.close {
    position: absolute;
    top: 10px; right: 10px;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}
.modal-content h2 {
    text-align: center;
    color: #b30000;
    margin-bottom: 25px;
}

/* Campos del formulario */
.campo {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}
.campo label {
    font-weight: 600;
    color: #475569;
    margin-bottom: 5px;
}
.campo input {
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 15px;
    transition: .3s;
}
.campo input:focus {
    outline: none;
    border-color: #b30000;
    box-shadow: 0 0 0 3px rgba(179,0,0,.15);
}
.contenedor-buscador {
    display: flex;
    justify-content: center;
    margin-bottom: 25px;
}

/* Tabla */

.tabla-usuarios {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,.08);
}
.tabla-usuarios th {
    background: #b30000;
    color: white;
    padding: 14px;
    text-align: left;
}
.tabla-usuarios td {
    padding: 12px 14px;
    border-bottom: 1px solid #e5e7eb;
}
.tabla-usuarios tr:hover { background: #f8fafc; }

/* Footer */
.footer {
    margin-top: 50px;
    padding: 20px;
    text-align: center;
    background: #b30000;
    color: white;
    border-radius: 12px 12px 0 0;
}

.footer p { margin: 5px 0; }

/* Responsividad */
@media (max-width: 768px) {
    h2 { font-size: 1.4rem; }
    .footer { flex-direction: column; gap: 8px; }
    .acciones button, .acciones-tabla button { flex: 1; min-width: 100%; }
}
@media (max-width: 600px) {

    .buscador {
        max-width: 100%;
        font-size: .9rem;
        padding: 10px 14px;
    }

}
@media (max-width: 600px) {
    .modal-content { padding: 20px; }
    /* Tabla como tarjetas */
    .tabla-usuarios, .tabla-usuarios thead, .tabla-usuarios tbody, .tabla-usuarios th, .tabla-usuarios td, .tabla-usuarios tr {
        display: block;
        width: 100%;
    }
    .tabla-usuarios tr {
        margin-bottom: 1rem;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,.05);
        padding: 12px;
    }
    .tabla-usuarios td { border: none; padding: 8px 0; }
    .tabla-usuarios th { display: none; }
}
@media (max-width: 600px) {

    .contenedor-cards {
        grid-template-columns: 1fr;
    }

    .card {
        padding: 1rem;
    }

}

/* Animaciones */
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-10px); }
}


</style>
