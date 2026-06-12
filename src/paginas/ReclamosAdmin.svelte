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

<div class="contenedor-cards">

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

</div>
<h2>✅ Reclamos Aprobados</h2>

<div class="contenedor-cards">

{#each reclamosAprobados as reclamo}

<div class="card card-aprobada">

    <h3>{reclamo.objeto}</h3>

    <p>
        {reclamo.solicitante}
    </p>

    <span class="estado-aprobado">
        ✓ Entrega Autorizada
    </span>

</div>

{/each}

</div>
<style>
    .contenedor-cards {
    display: grid;
    grid-template-columns:
        repeat(auto-fit,
        minmax(280px, 1fr));

    gap: 1.5rem;

    margin-bottom: 2rem;
}

.card {
    background: white;
    border-radius: 18px;
    padding: 1.5rem;
    border-left: 6px solid #b30000;
    box-shadow:
        0 8px 20px rgba(0,0,0,.08);

    transition: .3s;
}
.card:hover {
    transform: translateY(-5px);
    box-shadow:
        0 15px 35px rgba(0,0,0,.15);
}
h2 {
    color: #b30000;
    text-align: center;
    margin: 2rem 0 1rem;
}
h3 {
    color: #991b1b;
    margin-bottom: 1rem;
}
.card p {
    margin: .6rem 0;
    color: #475569;
}
.card p:nth-of-type(3) {
    background: #f8fafc;
    padding: 10px;
    border-radius: 10px;
    border-left: 4px solid #b30000;
}
.acciones {
    display: flex;
    gap: 10px;
    margin-top: 1rem;
}
.acciones button {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    font-weight: 600;
    transition: .3s;
}
.aprobar {
    background: #16a34a;
    color: white;
}

.aprobar:hover {
    background: #15803d;
}
.rechazar {
    background: #dc2626;
    color: white;
}

.rechazar:hover {
    background: #b91c1c;
}
.card-aprobada {
    border-left: 6px solid #16a34a;
}
.estado-aprobado {
    display: inline-block;
    margin-top: 10px;
    background: #dcfce7;
    color: #15803d;
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: bold;
}
</style>