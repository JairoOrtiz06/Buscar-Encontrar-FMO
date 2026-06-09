<script lang="ts">
    let pestaña = "usuarios";

    let usuariosPendientes = [
        { id: 1, nombre: "Juan Pérez", correo: "jperez@ues.edu.sv", carnet: "SM23001", fotoCarnet: "/usuario.png" },
        { id: 2, nombre: "Ana Martínez", correo: "amartinez@ues.edu.sv", carnet: "SM23002", fotoCarnet: "/usuario.png" }
    ];
    let usuariosAprobados = [
        {
            id: 101,
            nombre: "Carlos Gómez",
            correo: "cgomez@ues.edu.sv",
            carnet: "SM22001",
            estado: "Activo"
        },
        {
            id: 102,
            nombre: "María Pérez",
            correo: "mperez@ues.edu.sv",
            carnet: "SM22002",
            estado: "Activo"
        }
    
    ];
    let mostrarEditar = false;
    let usuarioEditando: any = null;

    let busqueda = "";

    let imagenSeleccionada = "";
    let notificacion = "";

   function aprobarUsuario(id:number) {

    const usuario = usuariosPendientes.find(
        u => u.id === id
    );

    if (usuario) {

        usuariosAprobados = [
            ...usuariosAprobados,
            {
                ...usuario,
                estado: "Activo"
            }
        ];

        usuariosPendientes =
            usuariosPendientes.filter(
                u => u.id !== id
            );

        mostrarNotificacion(
            "✅ Usuario aprobado"
        );
    }
}

    function rechazarUsuario(id: number) {
        usuariosPendientes =
            usuariosPendientes.filter(
                usuario => usuario.id !== id
            );

        mostrarNotificacion("❌ Usuario rechazado");
    }

    function mostrarNotificacion(mensaje: string) {
        notificacion = mensaje;

        setTimeout(() => {
            notificacion = "";
        }, 3000);
    }

    function desactivarUsuario(id:number) {

        usuariosAprobados =
            usuariosAprobados.map(usuario => {

                if (usuario.id === id) {

                    return {
                        ...usuario,
                        estado:
                            usuario.estado === "Activo"
                                ? "Inactivo"
                                : "Activo"
                    };
                }

                return usuario;
            });

        mostrarNotificacion(
            "🔄 Estado actualizado"
        );
    }

    function eliminarUsuario(id: number) {

        usuariosAprobados =
            usuariosAprobados.filter(
                usuario => usuario.id !== id
            );

        mostrarNotificacion(
            "🗑️ Usuario eliminado"
        );
    }
    function editarUsuario(usuario: any) {
    usuarioEditando = { ...usuario };
    mostrarEditar = true;}

    function guardarEdicion() {

    usuariosAprobados =
        usuariosAprobados.map(usuario =>

            usuario.id === usuarioEditando.id
                ? usuarioEditando
                : usuario

        );

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

{#each usuariosPendientes as usuario}
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

        <label>Nombre</label>
        <input bind:value={usuarioEditando.nombre}>

        <label>Correo</label>
        <input bind:value={usuarioEditando.correo}>

        <label>Carnet</label>
        <input bind:value={usuarioEditando.carnet}>

        <div class="acciones">

            <button
                class="aprobar"
                on:click={guardarEdicion}
            >
                Guardar
            </button>

            <button
                class="rechazar"
                on:click={() => mostrarEditar = false}
            >
                Cancelar
            </button>

        </div>

    </div>

</div>

{/if}

<hr>

<h2>Usuarios Registrados</h2>

<input
    type="text"
    bind:value={busqueda}
    placeholder="🔍 Buscar usuario..."
    class="buscador"
/>

{#each usuariosAprobados.filter(
    usuario =>
        usuario.nombre
            .toLowerCase()
            .includes(
                busqueda.toLowerCase()
            )
) as usuario}

<div class="card">

    <h3>{usuario.nombre}</h3>

    <p>
        <strong>Correo:</strong>
        {usuario.correo}
    </p>

    <p>
        <strong>Carnet:</strong>
        {usuario.carnet}
    </p>

    <p>
        <strong>Estado:</strong>

        <span
            class={usuario.estado === "Activo"
                ? "activo"
                : "inactivo"}>

            {usuario.estado}

        </span>
    </p>

    <div class="acciones">

        <button
            class="observacion"
            on:click={() =>
                desactivarUsuario(
                    usuario.id
                )}>

            {usuario.estado === "Activo"
                ? "Desactivar"
                : "Activar"}

        </button>

        <button
            class="rechazar"
            on:click={() =>
                eliminarUsuario(
                    usuario.id
                )}>

            Eliminar

        </button>
        <button
            class="editar"
            on:click={() => editarUsuario(usuario)}>
            ✏️ Editar
        </button>

    </div>

</div>

{/each}



<style>
    .card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
    }

    .notificacion {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        animation: fadeInOut 3s forwards;
        z-index: 2000;
    }

    .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: #fff;
        padding: 1rem;
        border-radius: 8px;
        position: relative;
        max-width: 80%;
        max-height: 80%;
        animation: fadeIn 0.3s ease;
    }

    .modal-content img {
        max-width: 100%;
        max-height: 70vh;
        border-radius: 4px;
    }

    .close {
        position: absolute;
        top: 10px; right: 10px;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
    }

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
    .buscador {
        width: 100%;
        max-width: 400px;
        display: block;
        margin: 20px auto;

        padding: 12px;

        border: 1px solid #ccc;
        border-radius: 10px;
    }   

    .activo {
        color: green;
        font-weight: bold;
    }

    .inactivo {
        color: red;
        font-weight: bold;
    }
    .editar {
        background: #3b82f6;
        color: white;
    }
</style>
