<script lang="ts">
    let reclamosPendientes = [
    {
        id: 1,
        objeto: "Calculadora Casio",
        solicitante: "Carlos Gómez",
        correo: "cgomez@ues.edu.sv",
        descripcion:
            "La calculadora tiene una pegatina azul con mis iniciales.",
        fecha: "2026-06-12"
    },
    {
        id: 2,
        objeto: "USB Kingston",
        solicitante: "María Pérez",
        correo: "mperez@ues.edu.sv",
        descripcion:
            "Tiene una cinta roja en el extremo.",
        fecha: "2026-06-13"
    }];

    let reclamosAprobados: any[] = [];

    function aprobarReclamo(id: number) {

    const reclamo =
        reclamosPendientes.find(
            r => r.id === id
        );

    if (reclamo) {

        reclamosAprobados = [
            ...reclamosAprobados,
            reclamo
        ];

        reclamosPendientes =
            reclamosPendientes.filter(
                r => r.id !== id
            );
    }
    }
    function rechazarReclamo(id: number) {

    reclamosPendientes =
        reclamosPendientes.filter(
            r => r.id !== id
        );
}
</script>
<h2>📋 Reclamos Pendientes</h2>

{#each reclamosPendientes as reclamo}

<div class="card">

    <h3>{reclamo.objeto}</h3>

    <p>
        <strong>Solicitante:</strong>
        {reclamo.solicitante}
    </p>

    <p>
        <strong>Correo:</strong>
        {reclamo.correo}
    </p>

    <p>
        <strong>Descripción:</strong>
        {reclamo.descripcion}
    </p>

    <p>
        <strong>Fecha:</strong>
        {reclamo.fecha}
    </p>

    <div class="acciones">

        <button
            class="aprobar"
            on:click={() =>
                aprobarReclamo(reclamo.id)}>
            Aprobar
        </button>

        <button
            class="rechazar"
            on:click={() =>
                rechazarReclamo(reclamo.id)}>
            Rechazar
        </button>

    </div>

</div>

{/each}
<h2>✅ Reclamos Aprobados</h2>

{#each reclamosAprobados as reclamo}

<div class="card">

    <h3>{reclamo.objeto}</h3>

    <p>{reclamo.solicitante}</p>

    <p class="estado-aprobado">
        Entrega Autorizada
    </p>

</div>

{/each}