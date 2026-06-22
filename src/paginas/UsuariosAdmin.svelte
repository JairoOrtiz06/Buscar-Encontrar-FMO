<script lang="ts">
    import { dbPromise } from '../base_datos/database.js';
    import { onMount } from 'svelte';
    import { DEPARTAMENTOS_CARRERAS }from '../servicios/registerService.js';
    // importar validaciones 
    import {
    validarNombre,
    validarCorreo,
    validarCarnet ,validarDUI,validarCodigoInstitucional} from '../utilidades/validaciones.js';
    import {
    validarTelefono
} from '../utilidades/validaciones.js';

    // variables 
    let pestaña = "usuarios";
    let usuarios: any[] = [];
    let usuariosPendientes: any[] = [];
    let usuariosAprobados: any[] = [];
    let carnets: Record<number, string> = {};
    let mostrarEditar = false;
    let usuarioEditando: any = null;
    let busqueda = "";
    let imagenSeleccionada = "";
    let notificacion = "";

    onMount(async () => {
        await cargarUsuarios();
    });

    async function cargarUsuarios() {

        const db = await dbPromise;

        const todos = await db.getAll(
            'usuarios'
        );

        usuarios = todos;

        usuariosPendientes = todos.filter(
            usuario =>
                usuario.tipo !== 'admin' &&
                usuario.estado === 'pendiente'
        );

        usuariosAprobados = todos.filter(
            usuario =>
                usuario.tipo !== 'admin' &&
                usuario.estado === 'aprobado'||
                usuario.estado === 'desactivado'
        );
        carnets = {};

    for (const usuario of todos) {

        const carnet =
            await obtenerCarnet(
                usuario.id
            );

        if (carnet) {

            carnets[usuario.id] =
                carnet.base64;
        }
    }
    }
    

    async function aprobarUsuario(
        id:number
    ) {

        const db = await dbPromise;

        const usuario = usuarios.find(
            u => u.id === id
        );

        if (!usuario) return;

        usuario.validado = true;

        usuario.estado =
            'aprobado';

        await db.put(
            'usuarios',
            usuario
        );

        await cargarUsuarios();

        mostrarNotificacion(
            '✅ Usuario aprobado'
        );
    }

    async function rechazarUsuario(
        id:number
    ) {

        const db = await dbPromise;

        const usuario = usuarios.find(
            u => u.id === id
        );

        if (!usuario) return;

        usuario.estado =
            'rechazado';

        await db.put(
            'usuarios',
            usuario
        );

        await cargarUsuarios();

        mostrarNotificacion(
            '❌ Usuario rechazado'
        );
    }

    async function desactivarUsuario(
        id:number
    ) {

        const db = await dbPromise;

        const usuario = usuarios.find(
            u => u.id === id
        );

        if (!usuario) return;

        usuario.estado =
            usuario.estado === 'aprobado'
                ? 'desactivado'
                : 'aprobado';

        await db.put(
            'usuarios',
            usuario
        );

        await cargarUsuarios();

        mostrarNotificacion(
            '🔄 Estado actualizado'
        );
    }

    async function obtenerCarnet(idUsuario:number) {

    const db = await dbPromise;

    const fotos = await db.getAllFromIndex(
        'fotos',
        'idUsuario',
        idUsuario
    );

    return fotos.find(
        foto => foto.tipo === 'carnet'
    );
}

    function editarUsuario(
        usuario:any
    ) {

        usuarioEditando = {
            ...usuario
        };

        mostrarEditar = true;
    }

    async function guardarEdicion() {

            const validNombre =
            validarNombre(
                usuarioEditando.nombre
            );

        if (!validNombre.valido) {

            
            if(validNombre.error){
                mostrarNotificacion(validNombre.error);
            }
            return;
        }

        const validCorreo =
            validarCorreo(
                usuarioEditando.correo
            );

        if (!validCorreo.valido) {

            
            if(validCorreo.error){
                mostrarNotificacion(validCorreo.error);
            }
            return;
        }

        // Solo validar carnet si existe
        if (usuarioEditando.carnet) {

            const validCarnet =
                validarCarnet(
                    usuarioEditando.carnet
                );

            if (!validCarnet.valido) {

                if (validCarnet.error) {
                    mostrarNotificacion(validCarnet.error);
                }
                return;
            }
        }
        const validDui =
        validarDUI(
                usuarioEditando.dui
            );

        if (!validDui.valido) {

            if (!validDui.valido) {
                if (validDui.error) {
                    mostrarNotificacion(validDui.error);
                }
                return;
            }
            return;
        }
        const validCodigo =
            validarCodigoInstitucional(
                usuarioEditando.codigoInstitucional
            );

        if (!validCodigo.valido) {
            if (validCodigo.error) {
                mostrarNotificacion(validCodigo.error);
            }
            return;
        }


        // Evitar correos duplicados
        const correoExiste =
            usuarios.some(
                usuario =>
                    usuario.id !== usuarioEditando.id &&
                    usuario.correo.toLowerCase() ===
                    usuarioEditando.correo.toLowerCase()
            );

        if (correoExiste) {

            mostrarNotificacion(
                'Ya existe un usuario con ese correo'
            );

            return;
        }

        // Evitar carnet duplicado
        if (usuarioEditando.carnet) {

            const carnetExiste =
                usuarios.some(
                    usuario =>
                        usuario.id !== usuarioEditando.id &&
                        usuario.carnet ===
                        usuarioEditando.carnet
                );

            if (carnetExiste) {

                mostrarNotificacion(
                    'Ya existe un usuario con ese carnet'
                );

                return;
            }
        }
        const validTelefono =
            validarTelefono(
                usuarioEditando.telefono
            );

        if (!validTelefono.valido) {

            
            if(validTelefono.error){
                mostrarNotificacion(validTelefono.error);
            }

            return;
        }
        const db = await dbPromise;

        await db.put(
            'usuarios',
            usuarioEditando
        );
        console.log('Guardado:', usuarioEditando);

        await cargarUsuarios();

        mostrarEditar = false;

        mostrarNotificacion(
            '✏️ Usuario actualizado'
        );
    }

    function cancelarEdicion() {

        mostrarEditar = false;

        usuarioEditando = null;
    }

    function mostrarNotificacion(
        mensaje:string
    ) {

        notificacion = mensaje;

        setTimeout(() => {

            notificacion = "";

        }, 3000);
    }
</script>
{#if notificacion} <div class="alert alert-danger position-fixed top-0 end-0 m-3 shadow" style="z-index:1050;">
{notificacion} </div>
{/if}

<div class="container-fluid">

<h2 class="text-center text-danger mb-4">
    Aprobar Registros
</h2>

<div class="row g-3">

    {#each usuariosPendientes as usuario}

        <div class="col-12 col-md-6 col-xl-4">

            <div class="card shadow h-100">

                <div class="card-body">

                    <h5 class="card-title text-danger">
                        {usuario.nombre}
                    </h5>

                    <p class="mb-2">
                        <strong>Correo:</strong><br>
                        {usuario.correo}
                    </p>

                    <p class="mb-3">
                        <strong>Carnet:</strong>
                        {usuario.carnet}
                    </p>

                    {#if carnets[usuario.id]}
                        <img
                            src={carnets[usuario.id]}
                            alt="Carnet"
                            class="img-fluid rounded border mb-3"
                        >
                    {:else}
                        <p class="text-muted">
                            Sin carnet
                        </p>
                    {/if}

                    <div class="d-grid gap-2 d-md-flex">

                        <button
                            class="btn btn-success btn-sm flex-fill"
                            on:click={() => aprobarUsuario(usuario.id)}>
                            Aprobar
                        </button>

                        <button
                            class="btn btn-danger btn-sm flex-fill"
                            on:click={() => rechazarUsuario(usuario.id)}>
                            Rechazar
                        </button>

                    </div>

                </div>

            </div>

        </div>

    {/each}

</div>

{#if mostrarEditar}

    <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">

        <div class="modal-dialog modal-dialog-centered">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Editar Usuario
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        on:click={() => mostrarEditar = false}>
                    </button>

                </div>

                <div class="modal-body">

                    
                <!--Parte del estudiante-->
                {#if usuarioEditando.tipo === 'estudiante'}

                <div class="mb-3">

                    <label class="form-label">
                        Carnet
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.carnet}
                        readonly>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Carrera
                    </label>

                    <select
                        class="form-select"
                        bind:value={usuarioEditando.carrera}>

                        {#each Object.values(DEPARTAMENTOS_CARRERAS).flat() as carrera}

                            <option value={carrera}>
                                {carrera}
                            </option>

                        {/each}

                    </select>

                </div>

                <!--Codigo para docente -->
                {:else if usuarioEditando.tipo === 'docente'}

                <div class="mb-3">

                    <label class="form-label">
                        Nombre
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.nombre}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Correo
                    </label>

                    <input
                        type="email"
                        class="form-control"
                        bind:value={usuarioEditando.correo}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        DUI
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.dui}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Teléfono
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.telefono}
                        maxlength="8">

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Código Institucional
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.codigoInstitucional}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Departamento
                    </label>

                    <select
                        class="form-select"
                        bind:value={usuarioEditando.departamento}>

                        {#each Object.keys(DEPARTAMENTOS_CARRERAS) as departamento}

                            <option value={departamento}>
                                {departamento}
                            </option>

                        {/each}

                    </select>

                </div>
                
                <!-- Personal de administracion y demas ramas de la facultad -->
                {:else if [
                    'administrativo',
                    'vigilante',
                    'mantenimiento',
                    'limpieza'
                ].includes(usuarioEditando.tipo)}

                <div class="mb-3">

                    <label class="form-label">
                        Nombre
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.nombre}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Correo
                    </label>

                    <input
                        type="email"
                        class="form-control"
                        bind:value={usuarioEditando.correo}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        DUI
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.dui}>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Teléfono
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.telefono}
                        maxlength="8">

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Código Institucional
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.codigoInstitucional}>

                </div>

                {#if usuarioEditando.tipo === 'administrativo'}

                <div class="mb-3">

                    <label class="form-label">
                        Área de Oficina
                    </label>

                    <input
                        class="form-control"
                        bind:value={usuarioEditando.areaOficina}>

                </div>

                {/if}

                {/if}

                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-success"
                        on:click={guardarEdicion}>
                        Guardar
                    </button>

                    <button
                        class="btn btn-secondary"
                        on:click={() => mostrarEditar = false}>
                        Cancelar
                    </button>

                </div>
                
            </div>

        </div>

    </div>

{/if}

<hr class="my-5">

<h2 class="text-center text-danger mb-4">
    Usuarios Registrados
</h2>

<div class="row justify-content-center mb-4">

    <div class="col-12 col-md-8 col-lg-6">

        <input
            type="text"
            bind:value={busqueda}
            placeholder="🔍 Buscar usuario..."
            class="form-control">

    </div>

</div>

<div class="table-responsive">

    <table class="table table-striped table-hover table-bordered shadow">

        <thead class="table-danger">

            <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Identificación</th>
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

                    <td>
                        {usuario.tipo === 'estudiante'
                            ? usuario.carnet
                            : usuario.codigoInstitucional}
                    </td>

                    <td>

                        <span
                            class="badge
                            {usuario.estado === 'aprobado'
                                ? 'bg-success'
                                : usuario.estado === 'desactivado'
                                    ? 'bg-secondary'
                                    : 'bg-danger'}"
                        >
                            {usuario.estado}
                        </span>

                    </td>

                    <td>

                        <div class="d-flex flex-column flex-md-row gap-2">

                            <button
                                class="btn btn-warning btn-sm"
                                on:click={() => desactivarUsuario(usuario.id)}>

                                {usuario.estado === "aprobado"
                                    ? "Desactivar"
                                    : "Reactivar"}

                            </button>

                            <button
                                class="btn btn-primary btn-sm"
                                on:click={() => editarUsuario(usuario)}>

                                Editar

                            </button>

                        </div>

                    </td>

                </tr>

            {/each}

        </tbody>

    </table>

</div>

</div>

<footer class=" bg-danger text-white text-center p-3 rounded mt-4">

    <p class="mb-1">
        © 2026 Encuentra UES-FMO
    </p>

    <p class="mb-1">
        Sistema de Gestión de Objetos Perdidos y Encontrados
    </p>

    <p class="mb-0">
        Universidad de El Salvador - Facultad Multidisciplinaria Oriental
    </p>

</footer>
