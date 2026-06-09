<script>
    import { dbPromise } from '../base_datos/database.js';
    
    // Variables del formulario
    let titulo = '';
    let descripcion = '';
    let categoria = 'otros';
    let ubicacion = '';
    let foto = null;
    let preview = null;
    let cargando = false;
    let mensaje = '';
    
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
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            mensaje = 'Selecciona una imagen';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            mensaje = 'La imagen debe ser menor a 5MB';
            return;
        }
        
        foto = file;
        const reader = new FileReader();
        reader.onload = e => preview = e.target.result;
        reader.readAsDataURL(file);
        mensaje = '';
    }
    
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
        });
    }
    
    async function handleSubmit() {
        if (!titulo.trim() || !categoria || !ubicacion.trim()) {
            mensaje = 'Completa todos los campos';
            return;
        }
        
        cargando = true;
        
        try {
            let fotoBase64 = null;
            if (foto) {
                fotoBase64 = await fileToBase64(foto);
            }
            
            const objeto = {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                categoria: categoria,
                ubicacion: ubicacion.trim(),
                foto: fotoBase64,
                idUsuario: 1,
                estado: 'pendiente',
                fechaPublicacion: new Date().toISOString()
            };
            
            const db = await dbPromise;
            await db.add('objetos', objeto);
            
            mensaje = '✅ Objeto publicado';
            setTimeout(() => goto('/'), 1000);
            
        } catch (error) {
            console.error(error);
            mensaje = '❌ Error al guardar';
        } finally {
            cargando = false;
        }
    }
</script>

<div class="page">
    <h1>Publicar Objeto</h1>
    
    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
            <label for="titulo">Título *</label>
            <input 
                id="titulo"
                type="text" 
                bind:value={titulo} 
                placeholder="Ej: Cuaderno de tapas rojas"
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
            <label for="ubicacion">Ubicación *</label>
            <input 
                id="ubicacion"
                type="text" 
                bind:value={ubicacion} 
                placeholder="Ej: Biblioteca - 2do piso"
                required
            />
        </div>
        
        <div class="form-group">
            <label for="foto">Foto</label>
            <input 
                id="foto"
                type="file" 
                accept="image/*"
                on:change={handleFileSelect}
            />
            
            {#if preview}
                <div class="preview">
                    <img src={preview} alt=" Preview" />
                    <button type="button" class="btn-remove" on:click={() => { foto = null; preview = null; }}>
                        ✕
                    </button>
                </div>
            {/if}
        </div>
        
        {#if mensaje}
            <div class="mensaje" class:error={mensaje.startsWith('❌')}>
                {mensaje}
            </div>
        {/if}
        
        <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Publicar'}
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
    
    .preview {
        position: relative;
        display: inline-block;
    }
    
    .preview img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid var(--border);
    }
    
    .btn-remove {
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
        background: var(--code-bg);
        color: var(--text);
        border-color: var(--border);
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