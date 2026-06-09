<script>
    export let objeto = {
        nombre: "",
        categoria: "",
        ubicacion: "",
        fechaHallazgo: ""
    };

    let motivo = "";
    let descripcion = "";
    let contacto = "";

    function enviarReclamo() {
        alert("Reclamo enviado correctamente");
    }
</script>

<h1>Solicitar Reclamo</h1>

<div class="contenedor">

    <div class="card">

        <h2>Información del Objeto</h2>

        <div class="info-objeto">
            <p>
                <strong>Objeto:</strong>
                {objeto.nombre}
            </p>

            <p>
                <strong>Categoría:</strong>
                {objeto.categoria}
            </p>

            <p>
                <strong>Ubicación:</strong>
                {objeto.ubicacion}
            </p>

            <p>
                <strong>Fecha:</strong>
                {objeto.fechaHallazgo}
            </p>
        </div>

        <label>Motivo del reclamo</label>

        <input
            type="text"
            bind:value={motivo}
            placeholder="Ejemplo: El objeto me pertenece"
        />

        <label>Descripción</label>

        <textarea
            bind:value={descripcion}
            placeholder="Describe características del objeto para verificar que es tuyo"
        ></textarea>

        <label>Teléfono o correo electrónico</label>

        <input
            type="text"
            bind:value={contacto}
            placeholder="Ingrese un medio de contacto"
        />

        <button
            on:click={enviarReclamo}
            disabled={!motivo || !descripcion || !contacto}
        >
            Enviar Reclamo
        </button>

    </div>

</div>

<style>
    h1 {
        text-align: center;
        color: white;
        font-size: 3rem;
        margin-bottom: 30px;
        font-weight: bold;
    }

    .contenedor {
        display: flex;
        justify-content: center;
        padding: 20px;
    }

    .card {
        width: 750px;
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 20px;
        padding: 35px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    h2 {
        text-align: center;
        color: #3b82f6;
        margin-bottom: 20px;
        font-size: 1.8rem;
    }

    .info-objeto {
        background: #111827;
        border: 1px solid #2563eb;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
    }

    .info-objeto p {
        text-align: center;
        margin: 12px 0;
        font-size: 18px;
    }

    label {
        display: block;
        margin-top: 18px;
        margin-bottom: 8px;
        font-size: 17px;
        font-weight: 600;
        color: #e5e7eb;
    }

    input,
    textarea {
        width: 100%;
        padding: 14px;
        border-radius: 10px;
        border: 1px solid #374151;
        background: #1f2937;
        color: white;
        font-size: 16px;
        box-sizing: border-box;
        transition: 0.3s;
    }

    input:focus,
    textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    }

    textarea {
        min-height: 150px;
        resize: vertical;
    }

    button {
        width: 100%;
        margin-top: 25px;
        padding: 15px;
        border: none;
        border-radius: 10px;
        background: #2563eb;
        color: white;
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
    }

    button:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-2px);
    }

    button:disabled {
        background: #6b7280;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        .card {
            width: 95%;
            padding: 20px;
        }

        h1 {
            font-size: 2.2rem;
        }
    }
</style>