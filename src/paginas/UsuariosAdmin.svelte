<script lang="ts">
    let pestaña = "usuarios";

    import { dbPromise } from '../base_datos/database.js';
    import { onMount } from 'svelte';

    let usuarios: any[] = [];
    let carnets: Record<number, string> = {};

    let usuariosPendientes: any[] = [];
    let usuariosAprobados: any[] = [];
    async function cargarUsuarios() {

    const db = await dbPromise;

    const todos = await db.getAll('usuarios');

        usuariosPendientes = todos.filter(
            usuario =>
                usuario.tipo !== 'admin' &&
                usuario.estado === 'pendiente'
        );

        usuariosAprobados = todos.filter(
            usuario =>
                usuario.tipo !== 'admin' &&
                usuario.estado === 'aprobado'
        );
    }

    
   onMount(async () => {
        await cargarUsuarios();
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

        await cargarUsuarios();

        mostrarNotificacion(
            '✅ Usuario aprobado'
        );
    }

    async function obtenerFotoPerfil(idUsuario:number) {
    const db = await dbPromise;

    const fotos = await db.getAllFromIndex(
        'fotos',
        'idUsuario',
        idUsuario
    );

    return fotos.find(
        foto => foto.tipo === 'perfil'
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

        await cargarUsuarios();

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

        await cargarUsuarios();

        mostrarEditar = false;

        mostrarNotificacion(
            "✏️ Usuario actualizado"
        );
    }
</script>
{#if notificacion}
    <div class="alert alert-danger position-fixed top-0 end-0 m-3 shadow">
        {notificacion}
    </div>
{/if}

<h2 class="text-center text-danger mb-4">Aprobar Registros</h2>

<div class="row g-3">
    {#each usuarios as usuario}
        <div class="col-md-4">
            <div class="card shadow h-100">
                <div class="card-body">
                    <h5 class="card-title text-danger">{usuario.nombre}</h5>
                    <p><strong>Correo:</strong> {usuario.correo}</p>
                    <p><strong>Carnet:</strong> {usuario.carnet}</p>

                    {#if carnets[usuario.id]}
                        <img src={carnets[usuario.id]} alt="Carnet" class="img-fluid rounded mb-3">
                    {:else}
                        <p class="text-muted">Sin carnet</p>
                    {/if}

                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm" on:click={() => aprobarUsuario(usuario.id)}>Aprobar</button>
                        <button class="btn btn-danger btn-sm" on:click={() => rechazarUsuario(usuario.id)}>Rechazar</button>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

{#if mostrarEditar}
    <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Usuario</h5>
                    <button type="button" class="btn-close" on:click={() => mostrarEditar = false}></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input class="form-control" bind:value={usuarioEditando.nombre}>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correo</label>
                        <input class="form-control" bind:value={usuarioEditando.correo}>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Carnet</label>
                        <input class="form-control" bind:value={usuarioEditando.carnet}>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" on:click={guardarEdicion}>Guardar</button>
                    <button class="btn btn-secondary" on:click={() => mostrarEditar = false}>Cancelar</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<hr>

<h2 class="text-center text-danger mb-4">Usuarios Registrados</h2>

<div class="mb-3 d-flex justify-content-center">
    <input type="text" bind:value={busqueda} placeholder="🔍 Buscar usuario..." class="form-control w-50">
</div>

<table class="table table-striped table-hover shadow">
    <thead class="table-danger">
        <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Carnet</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        {#each usuariosAprobados.filter(
            usuario => usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
        ) as usuario}
            <tr>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.carnet}</td>
                <td>
                    <span class="badge {usuario.estado === 'aprobado' ? 'bg-success' : 'bg-danger'}">
                        {usuario.estado}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning btn-sm" on:click={() => desactivarUsuario(usuario.id)}>
                            {usuario.estado === "aprobado" ? "Desactivar" : "Activar"}
                        </button>
                        <button class="btn btn-primary btn-sm" on:click={() => editarUsuario(usuario)}>
                            Editar
                        </button>
                    </div>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<footer class="bg-danger text-white text-center p-3 rounded mt-4">
    <p>© 2026 Encuentra UES-FMO</p>
    <p>Sistema de Gestión de Objetos Perdidos y Encontrados</p>
    <p>Universidad de El Salvador - Facultad Multidisciplinaria Oriental</p>
</footer>
