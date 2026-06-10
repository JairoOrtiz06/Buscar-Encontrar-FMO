<script>
    import { dbPromise } from '../base_datos/database.js';

    export let objeto = {
        id: null,
        titulo: "",
        categoria: "",
        ubicacion: "",
        fechaPublicacion: "",
        foto: ""
    };

    export let volver = () => {};

    let motivo = "";
    let descripcion = "";
    let contacto = "";

    async function enviarReclamo() {
        try {
            const db = await dbPromise;

            await db.add('reclamos', {
                idObjeto: objeto.id,
                idSolicitante: null,
                motivo,
                descripcion,
                contacto,
                estado: 'pendiente',
                fechaSolicitud: new Date().toISOString()
            });

            alert("Reclamo enviado correctamente");

            motivo = "";
            descripcion = "";
            contacto = "";

            volver();

        } catch (error) {
            console.error(error);
            alert("Error al guardar el reclamo");
        }
    }
</script>

<div class="contenedor-volver">
    <button class="btn-volver" on:click={volver}>
        ← Volver
    </button>
</div>

<h1>Solicitar Reclamo</h1>

<div class="contenedor">
    <div class="card">

        <h2>Información del Objeto</h2>

        <div class="info-objeto">

            {#if objeto.foto}
                <img
                    src={objeto.foto}
                    alt={objeto.titulo}
                    class="imagen-objeto"
                />
            {/if}

            <p>
                <strong>Objeto:</strong>
                {objeto.titulo}
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
                {objeto.fechaPublicacion
                    ? new Date(objeto.fechaPublicacion).toLocaleDateString()
                    : ""}
            </p>

        </div>

        <label for="motivo">Motivo del reclamo</label>

        <input
            id="motivo"
            type="text"
            bind:value={motivo}
            placeholder="Ejemplo: El objeto me pertenece"
        />

        <label for="descripcion">Descripción</label>

        <textarea
            id="descripcion"
            bind:value={descripcion}
            placeholder="Describe características del objeto para verificar que es tuyo"
        ></textarea>

        <label for="contacto">Teléfono o correo electrónico</label>

        <input
            id="contacto"
            type="text"
            bind:value={contacto}
            placeholder="Ingrese un medio de contacto"
        />

        <button
            class="btn-enviar"
            on:click={enviarReclamo}
            disabled={!motivo || !descripcion || !contacto}
        >
            Enviar Reclamo
        </button>

    </div>
</div>

<style>
    .contenedor-volver {
        padding: 20px;
    }

    .btn-volver {
        width: auto;
        display: inline-block;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: #374151;
        color: white;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
    }

    .btn-volver:hover {
        background: #4b5563;
    }

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

    .imagen-objeto {
        width: 250px;
        height: 180px;
        object-fit: cover;
        border-radius: 10px;
        display: block;
        margin: 0 auto 20px auto;
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

    .btn-enviar {
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

    .btn-enviar:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-2px);
    }

    .btn-enviar:disabled {
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

        .imagen-objeto {
            width: 100%;
            height: auto;
        }
    }
</style>