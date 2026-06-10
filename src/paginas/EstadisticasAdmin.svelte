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

    <div class="stat-card">
        <h3>👥 Usuarios</h3>
        <p>{estadisticas.usuarios}</p>
    </div>

    <div class="stat-card">
        <h3>📦 Objetos</h3>
        <p>{estadisticas.objetosPublicados}</p>
    </div>

    <div class="stat-card">
        <h3>📋 Reclamos</h3>
        <p>{estadisticas.reclamos}</p>
    </div>

    <div class="stat-card">
        <h3>✅ Recuperados</h3>
        <p>{estadisticas.recuperados}</p>
    </div>

    <div class="stat-card">
        <h3>🗄️ Archivados</h3>
        <p>{estadisticas.archivados}</p>
    </div>

</div>

<style>
    .estadisticas {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
    }

    .stat-card {
        width: 220px;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,.1);
    }

    .stat-card h3 {
        margin-bottom: 10px;
    }

    .stat-card p {
        font-size: 2rem;
        font-weight: bold;
        color: #2563eb;
    }
</style>