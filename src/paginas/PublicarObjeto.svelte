<script>
    import { crearObjeto, verificarDuplicado } from '../crud/objetos.js';
    import { usuarioActual } from '../stores/authStore.js';
    
    // Variables del formulario
    let titulo = '';
    let descripcion = '';
    let categoria = 'otros';
    let ubicacion = '';
    let foto = null;
    let vistaPrevia = null;
    let guardando = false;
    let mensaje = '';
    let duplicadoDetectado = false;
    
    // Categorías disponibles
    const categorias = [
        { valor: 'carnés', label: 'Carnés' },
        { valor: 'memorias usb', label: 'Memorias USB' },
        { valor: 'calculadoras', label: 'Calculadoras' },
        { valor: 'cuadernos', label: 'Cuadernos' },
        { valor: 'mochilas', label: 'Mochilas' },
        { valor: 'llaves', label: 'Llaves' },
        { valor: 'cargadores', label: 'Cargadores' },
        { valor: 'teléfonos', label: 'Teléfonos' },
        { valor: 'documentos', label: 'Documentos' },
        { valor: 'otros', label: 'Otros' }
    ];
    
    // Función para procesar la imagen seleccionada
    function procesarImagen(evento) {
        const archivo = evento.target.files[0];
        if (!archivo) return;
        
        // Validar tipo de archivo
        if (!archivo.type.startsWith('image/')) {
            mensaje = 'Selecciona una imagen';
            return;
        }
        
        // Validar tamaño máximo (5MB)
        if (archivo.size > 5 * 1024 * 1024) {
            mensaje = 'La imagen debe ser menor a 5MB';
            return;
        }
        
        foto = archivo;
        
        // Mostrar vista previa
        const lector = new FileReader();
        lector.onload = e => vistaPrevia = e.target.result;
        lector.readAsDataURL(archivo);
        
        mensaje = '';
        duplicadoDetectado = false;
    }
    
    // Función para convertir imagen a Base64
    function convertirImagenABase64(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.readAsDataURL(archivo);
            lector.onload = () => resolve(lector.result);
            lector.onerror = () => reject(lector.error);
        });
    }
    
    // Función para verificar duplicados en tiempo real
    async function buscarDuplicados() {
        if (!titulo.trim() || !categoria || !ubicacion.trim()) {
            return { valido: true, duplicado: false };
        }
        
        try {
            const duplicado = await verificarDuplicado(titulo, categoria, ubicacion);
            return { valido: true, duplicado: !!duplicado };
        } catch (e) {
            return { valido: false, duplicado: false };
        }
    }
    
    // Función principal para guardar el objeto
    async function guardarObjeto() {
        // Validar campos requeridos
        if (!titulo.trim() || !categoria || !ubicacion.trim()) {
            mensaje = 'Completa todos los campos';
            return;
        }
        
        mensaje = '';
        duplicadoDetectado = false;
        
        // Verificar duplicado antes de guardar
        const verificacion = await buscarDuplicados();
        
        if (verificacion.duplicado) {
            duplicadoDetectado = true;
            mensaje = '⚠️ Ya existe un objeto con información similar. No se puede duplicar.';
            return;
        }
        
        guardando = true;
        
        try {
            // Convertir imagen a Base64 si existe
            let imagenBase64 = null;
            if (foto) {
                imagenBase64 = await convertirImagenABase64(foto);
            }
            
            // Crear objeto
            if (!$usuarioActual?.id) {
                mensaje = 'Debes iniciar sesión para publicar el objeto.';
                guardando = false;
                return;
            }

            const objeto = {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                categoria: categoria,
                ubicacion: ubicacion.trim(),
                foto: imagenBase64,
                idUsuario: $usuarioActual.id
            };
            
            // Guardar en la base de datos
            await crearObjeto(objeto);
            
            mensaje = '✅ Objeto publicado correctamente';
            
            // Redireccionar al inicio después de 1.5 segundos
            setTimeout(() => window.location.href = '/', 1500);
            
        } catch (error) {
            console.error(error);
            
            if (error.message === 'DUPLICADO') {
                duplicadoDetectado = true;
                mensaje = '⚠️ Ya existe un objeto con información similar. No se puede duplicar.';
            } else {
                mensaje = '❌ Error al guardar el objeto';
            }
        } finally {
            guardando = false;
        }
    }
    
    // Función para quitar la imagen seleccionada
    function quitarImagen() {
        foto = null;
        vistaPrevia = null;
    }
</script>

<div class="page">
    <h1>Publicar Objeto</h1>
    
    <form on:submit|preventDefault={guardarObjeto}>
        <div class="form-group">
            <label for="titulo">Título *</label>
            <input 
                id="titulo"
                type="text" 
                bind:value={titulo} 
                placeholder="Ej: Cuaderno de tapas rojas"
                on:input={() => duplicadoDetectado = false}
                required
            />
        </div>
        
        <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea 
                id="descripcion"
                bind:value={descripcion} 
                placeholder="Describe el objeto..."
                rows="3"
            ></textarea>
        </div>
        
        <div class="form-group">
            <label for="categoria">Categoría *</label>
            <select id="categoria" bind:value={categoria} required>
                {#each categorias as cat}
                    <option value={cat.valor}>{cat.label}</option>
                {/each}
            </select>
        </div>
        
        <div class="form-group">
            <label for="ubicacion">Ubicación donde lo encontraste *</label>
            <input 
                id="ubicacion"
                type="text" 
                bind:value={ubicacion} 
                placeholder="Ej: Biblioteca - 2do piso"
                on:input={() => duplicadoDetectado = false}
                required
            />
        </div>
        
        <div class="form-group">
            <label for="foto">Foto del objeto</label>
            <input 
                id="foto"
                type="file" 
                accept="image/*"
                on:change={procesarImagen}
            />
            
            {#if vistaPrevia}
                <div class="vista-previa">
                    <img src={vistaPrevia} alt="Vista previa" />
                    <button type="button" class="btn-quitar" on:click={quitarImagen}>
                        ✕
                    </button>
                </div>
            {/if}
        </div>
        
        {#if mensaje}
            <div class="mensaje" class:error={mensaje.startsWith('❌') || duplicadoDetectado}>
                {mensaje}
            </div>
        {/if}
        
        {#if duplicadoDetectado}
            <div class="advertencia">
                📝 El objeto ya existe con el mismo título, categoría y ubicación. 
                Si crees que es diferente, modifica algún campo.
            </div>
        {/if}
        
        <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Publicar'}
        </button>
    </form>
</div>

<style>
    .page {
        max-width: 500px;
        margin: 0 auto;
        padding: 2rem;
        text-align: left;
    }
    
    h1 {
        text-align: center;
    }
    
    form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    label {
        font-weight: 500;
        color: var(--text-h);
    }
    
    input[type="text"],
    select,
    textarea,
    input[type="file"] {
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--text);
        font-size: 1rem;
        font-family: inherit;
    }
    
    input:focus,
    select:focus,
    textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-bg);
    }
    
    textarea {
        resize: vertical;
    }
    
    .vista-previa {
        position: relative;
        display: inline-block;
    }
    
    .vista-previa img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid var(--border);
    }
    
    .btn-quitar {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--accent);
        color: white;
        border: none;
        cursor: pointer;
    }
    
    .mensaje {
        padding: 0.75rem;
        border-radius: 4px;
        background: var(--accent-bg);
        color: var(--accent);
        text-align: center;
        border: 1px solid var(--accent-border);
    }
    
    .mensaje.error {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fecaca;
    }
    
    .advertencia {
        padding: 0.75rem;
        border-radius: 4px;
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
        font-size: 0.9rem;
    }
    
    button[type="submit"] {
        padding: 1rem;
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
    }
    
    button[type="submit"]:hover:not(:disabled) {
        box-shadow: var(--shadow);
    }
    
    button[type="submit"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>