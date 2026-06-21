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

<div class="mb-3">
    <button class="btn btn-secondary" on:click={volver}>
        ← Volver
    </button>
</div>

<h1 class="text-center mb-4">Solicitar Reclamo</h1>

<div class="d-flex justify-content-center">
    <div class="card shadow-lg w-75">
        <div class="card-body">
            <h2 class="card-title text-primary text-center mb-3">Información del Objeto</h2>

            <div class="border rounded p-3 mb-4 bg-light">
                {#if objeto.foto}
                    <img src={objeto.foto} alt={objeto.titulo} class="img-fluid rounded mx-auto d-block mb-3" style="max-height:200px;">
                {/if}

                <p><strong>Objeto:</strong> {objeto.titulo}</p>
                <p><strong>Categoría:</strong> {objeto.categoria}</p>
                <p><strong>Ubicación:</strong> {objeto.ubicacion}</p>
                <p><strong>Fecha:</strong> {objeto.fechaPublicacion ? new Date(objeto.fechaPublicacion).toLocaleDateString() : ""}</p>
            </div>

            <div class="mb-3">
                <label for="motivo" class="form-label">Motivo del reclamo</label>
                <input id="motivo" type="text" class="form-control" bind:value={motivo} placeholder="Ejemplo: El objeto me pertenece">
            </div>

            <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" class="form-control" bind:value={descripcion} placeholder="Describe características del objeto para verificar que es tuyo"></textarea>
            </div>

            <div class="mb-3">
                <label for="contacto" class="form-label">Teléfono o correo electrónico</label>
                <input id="contacto" type="text" class="form-control" bind:value={contacto} placeholder="Ingrese un medio de contacto">
            </div>

            <button class="btn btn-primary w-100" on:click={enviarReclamo} disabled={!motivo || !descripcion || !contacto}>
                Enviar Reclamo
            </button>
        </div>
    </div>
</div>
