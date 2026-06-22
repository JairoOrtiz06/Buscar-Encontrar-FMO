<script lang="ts">
    import { onMount } from 'svelte';
    import { dbPromise } from '../base_datos/database.js';

    let estadisticas = {
        usuarios: 0,
        objetosPublicados: 0,
        reclamos: 0,
        recuperados: 0,
        archivados: 0,
        pendientes:0,
        aprobados:0,
        rechazados:0
    };

    onMount(async () => {
        await cargarEstadisticas();
    });

    async function cargarEstadisticas() {

        const db = await dbPromise;

        const usuarios =
            await db.getAll('usuarios');

        const objetos =
            await db.getAll('objetos');

        const reclamos =
            await db.getAll('reclamos');

        const entregas =
            await db.getAll('entregas');

        estadisticas = {

            usuarios: usuarios.length,

            objetosPublicados: objetos.length,

            reclamos: reclamos.length,

            recuperados: entregas.length,

            archivados: objetos.filter(
                o => o.estado === 'archivado'
            ).length,
            pendientes:
                objetos.filter(
                    o => o.estado === 'pendiente'
                ).length,

            aprobados:
            reclamos.filter(
                r => r.estado === 'aprobado'
            ).length,

        rechazados:
            reclamos.filter(
                r => r.estado === 'rechazado'
            ).length,
                };
    }
</script>
<h2 class="text-center text-danger mb-4">
    📊 Estadísticas del Sistema
</h2>

<div class="row g-4">

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-primary h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Usuarios</h5>
                <h1 class="text-primary fw-bold">
                    {estadisticas.usuarios}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-warning h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Objetos</h5>
                <h1 class="text-warning fw-bold">
                    {estadisticas.objetosPublicados}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-info h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Reclamos</h5>
                <h1 class="text-info fw-bold">
                    {estadisticas.reclamos}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-secondary h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Archivados</h5>
                <h1 class="text-secondary fw-bold">
                    {estadisticas.archivados}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-dark h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Pendientes</h5>
                <h1 class="text-dark fw-bold">
                    {estadisticas.pendientes}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-primary h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Entregados</h5>
                <h1 class="text-primary fw-bold">
                    {estadisticas.recuperados}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-success h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Aprobados</h5>
                <h1 class="text-success fw-bold">
                    {estadisticas.aprobados}
                </h1>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card shadow border-danger h-100">
            <div class="card-body text-center">
                <h5 class="card-title"> Rechazados</h5>
                <h1 class="text-danger fw-bold">
                    {estadisticas.rechazados}
                </h1>
            </div>
        </div>
    </div>

</div>

<footer class="bg-danger text-white text-center p-3 rounded mt-5">

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