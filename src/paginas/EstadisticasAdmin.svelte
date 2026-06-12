<script>
    let estadisticas = {
        usuarios: 125,
        objetosPublicados: 87,
        reclamos: 34,
        recuperados: 21,
        archivados: 13
    };

</script>
<h2>📊 Estadísticas del Sistema</h2>

<div class="estadisticas">

    <div class="stat-card usuarios">
        <h3>👥 Usuarios</h3>
        <p>{estadisticas.usuarios}</p>
    </div>

    <div class="stat-card objetos">
        <h3>📦 Objetos</h3>
        <p>{estadisticas.objetosPublicados}</p>
    </div>

    <div class="stat-card reclamos">
        <h3>📋 Reclamos</h3>
        <p>{estadisticas.reclamos}</p>
    </div>

    <div class="stat-card recuperados">
        <h3>✅ Recuperados</h3>
        <p>{estadisticas.recuperados}</p>
    </div>

    <div class="stat-card archivados">
        <h3>🗄️ Archivados</h3>
        <p>{estadisticas.archivados}</p>
    </div>

</div>

<style>
  h2 {
    text-align: center;
    color: #b30000;
    margin-bottom: 2rem;
}

.estadisticas {
    display: grid;

    grid-template-columns:
        repeat(auto-fit,
        minmax(220px, 1fr));

    gap: 20px;
}

.stat-card {
    background: white;
    border-radius: 18px;
    padding: 25px;
    text-align: center;
    box-shadow:
        0 8px 20px rgba(0,0,0,.08);

    transition: .3s;
    border-top: 5px solid #b30000;
}

.stat-card:hover {
    transform: translateY(-6px);
    box-shadow:
        0 15px 35px rgba(0,0,0,.15);
}
.stat-card h3 {
    margin-bottom: 15px;
    color: #475569;
    font-size: 1rem;
}
.stat-card p {
    font-size: 3rem;
    font-weight: bold;
    margin: 0;
    color: #b30000;
}
.usuarios {
    border-top-color: #2563eb;
}

.objetos {
    border-top-color: #f59e0b;
}

.reclamos {
    border-top-color: #7c3aed;
}

.recuperados {
    border-top-color: #16a34a;
}

.archivados {
    border-top-color: #64748b;
}
@media (max-width: 600px) {

    .estadisticas {
        grid-template-columns: 1fr;
    }

    .stat-card p {
        font-size: 2.5rem;
    }

}
</style>