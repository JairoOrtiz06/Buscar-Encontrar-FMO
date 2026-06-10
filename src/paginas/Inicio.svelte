<script>
    import { onMount } from 'svelte';
    import { openDB } from 'idb';
    
    let objetos = [];
    let objetosFiltrados = [];
    let cargando = true;
    let busqueda = '';
    let categoriaSeleccionada = 'todos';
    let objetoSeleccionado = null;
    let mostrandoModal = false;
    
    const dbPromise = openDB('encuentraUES', 1);
    
    const categorias = [
        { valor: 'todos', label: 'Todos', icono: '📦' },
        { valor: 'carnés', label: 'Carnés', icono: '💳' },
        { valor: 'memorias usb', label: 'USB', icono: '💾' },
        { valor: 'calculadoras', label: 'Calculadoras', icono: '🧮' },
        { valor: 'cuadernos', label: 'Cuadernos', icono: '📓' },
        { valor: 'mochilas', label: 'Mochilas', icono: '🎒' },
        { valor: 'llaves', label: 'Llaves', icono: '🔑' },
        { valor: 'cargadores', label: 'Cargadores', icono: '🔌' },
        { valor: 'teléfonos', label: 'Teléfonos', icono: '📱' },
        { valor: 'documentos', label: 'Documentos', icono: '📄' },
        { valor: 'otros', label: 'Otros', icono: '📦' }
    ];
    
    onMount(async () => {
        await cargarObjetos();
    });
    
    async function cargarObjetos() {
        cargando = true;
        try {
            const db = await dbPromise;
            const todos = await db.getAll('objetos');
            objetos = todos.filter(o => o.estado === 'pendiente');
            aplicarFiltros();
        } catch (e) {
            console.error(e);
        } finally {
            cargando = false;
        }
    }
    
    function aplicarFiltros() {
        let resultado = [...objetos];
        
        if (categoriaSeleccionada !== 'todos') {
            resultado = resultado.filter(o => o.categoria === categoriaSeleccionada);
        }
        
        if (busqueda.trim()) {
            const texto = busqueda.toLowerCase();
            resultado = resultado.filter(o => 
                o.titulo.toLowerCase().includes(texto) ||
                (o.descripcion && o.descripcion.toLowerCase().includes(texto)) ||
                o.categoria.toLowerCase().includes(texto) ||
                o.ubicacion.toLowerCase().includes(texto)
            );
        }
        
        resultado.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        objetosFiltrados = resultado;
    }
    
    function cambiarCategoria(cat) {
        categoriaSeleccionada = cat;
        aplicarFiltros();
    }
    
    function verDetalles(obj) {
        objetoSeleccionado = obj;
        mostrandoModal = true;
    }
    
    function cerrarModal() {
        mostrandoModal = false;
        objetoSeleccionado = null;
    }
    
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        return new Date(fecha).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    function irLogin() { window.location.href = '/login'; }
    function irRegistro() { window.location.href = '/registro'; }
</script>

<div class="pagina">
    <header class="hero">
        <h1>🔍 Encuentra UES</h1>
        <p class="tagline">Recupera tus objetos perdidos en la Universidad de El Salvador</p>
    </header>
    
    <div class="buscador">
        <div class="input-buscar">
            <span>🔍</span>
            <input type="text" placeholder="Buscar objetos..." bind:value={busqueda} on:input={aplicarFiltros} />
            {#if busqueda}<button on:click={() => busqueda = ''}>✕</button>{/if}
        </div>
    </div>
    
    <div class="filtros">
        {#each categorias as cat}
            <button class="filtro" class:activo={categoriaSeleccionada === cat.valor} on:click={() => cambiarCategoria(cat.valor)}>
                <span>{cat.icono}</span> {cat.label}
            </button>
        {/each}
    </div>
    
    <div class="contador">{objetosFiltrados.length} objeto(s) encontrado(s)</div>
    
    {#if cargando}
        <div class="cargando"><div class="spinner"></div><p>Cargando...</p></div>
    {:else if objetosFiltrados.length === 0}
        <div class="vacio"><p>📭 No hay objetos</p><button on:click={irRegistro}>Publicar</button></div>
    {:else}
        <div class="grid">
            {#each objetosFiltrados as obj}
                <div class="tarjeta" on:click={() => verDetalles(obj)}>
                    <div class="img-box">
                        {#if obj.foto}<img src={obj.foto} alt={obj.titulo} />{:else}<div class="sin-foto">📦</div>{/if}
                        <span class="cat-badge">{obj.categoria}</span>
                    </div>
                    <div class="info"><h3>{obj.titulo}</h3><p>📍 {obj.ubicacion}</p></div>
                </div>
            {/each}
        </div>
    {/if}
    
    <div class="cta">
        <p>¿Ya tienes cuenta?</p>
        <div class="btns">
        <button on:click={irLogin}>Login</button><button on:click={irRegistro}>Registrarse</button></div>
    </div>
</div>

{#if mostrandoModal && objetoSeleccionado}
    <div class="modal-fondo" on:click={cerrarModal}>
        <div class="modal" on:click|stopPropagation>
            <button class="x-btn" on:click={cerrarModal}>✕</button>
            {#if objetoSeleccionado.foto}<img src={objetoSeleccionado.foto} alt={objetoSeleccionado.titulo} class="m-img"/>{:else}<div class="m-sin">📦</div>{/if}
            <h2>{objetoSeleccionado.titulo}</h2>
            <div class="detalles"><p><b>Categoría:</b> {objetoSeleccionado.categoria}</p><p><b>Ubicación:</b> {objetoSeleccionado.ubicacion}</p><p><b>Fecha:</b> {formatearFecha(objetoSeleccionado.fechaPublicacion)}</p></div>
            <button class="btn-reclamar" on:click={irLogin}>🔐 Reclamar</button>
        </div>
    </div>
{/if}

<style>
    .pagina { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
    .hero { text-align: center; padding: 2.5rem 1rem; background: var(--code-bg); border-radius: 12px; margin-bottom: 2rem; }
    .hero h1 { font-size: 2.75rem; margin: 0; }
    .tagline { color: var(--text); font-size: 1.15rem; }
    
    .buscador { margin-bottom: 1.5rem; }
    .input-buscar { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; border: 2px solid var(--border); border-radius: 50px; background: var(--bg); }
    .input-buscar input { flex: 1; border: none; background: transparent; font-size: 1rem; color: var(--text); }
    .input-buscar input:focus { outline: none; }
    .input-buscar button { background: transparent; border: none; cursor: pointer; }
    
    .filtros { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
    .filtro { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 50px; background: var(--bg); cursor: pointer; }
    .filtro.activo { background: var(--accent); color: white; border-color: var(--accent); }
    
    .contador { text-align: center; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .tarjeta { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); overflow: hidden; cursor: pointer; transition: transform 0.25s; }
    .tarjeta:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
    .img-box { position: relative; height: 160px; }
    .img-box img { width: 100%; height: 100%; object-fit: cover; }
    .img-box .sin-foto { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--code-bg); font-size: 3.5rem; }
    .cat-badge { position: absolute; top: 0.75rem; right: 0.75rem; padding: 0.25rem 0.75rem; background: rgba(0,0,0,0.7); color: white; border-radius: 50px; font-size: 0.75rem; text-transform: capitalize; }
    .info { padding: 1rem; }
    .info h3 { margin: 0 0 0.5rem; }
    .info p { color: var(--text); font-size: 0.875rem; margin: 0; }
    
    .cargando, .vacio { text-align: center; padding: 4rem; }
    .spinner { width: 48px; height: 48px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .vacio button { padding: 0.875rem 2rem; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 1rem; }
    
    .cta { text-align: center; padding: 2rem; border-top: 1px solid var(--border); margin-top: 2rem; }
    .btns { display: flex; gap: 1rem; justify-content: center; }
    .btns button { padding: 0.875rem 1.75rem; border-radius: 8px; cursor: pointer; }
    .btns button:first-child { background: var(--accent); color: white; border: none; }
    .btns button:last-child { background: transparent; color: var(--accent); border: 2px solid var(--accent); }
    
    .modal-fondo { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg); border-radius: 16px; padding: 1.5rem; width: 90%; max-width: 480px; position: relative; }
    .x-btn { position: absolute; top: 1rem; right: 1rem; width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; }
    .m-img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem; }
    .m-sin { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: var(--code-bg); border-radius: 8px; font-size: 4rem; margin-bottom: 1rem; }
    .modal h2 { margin: 0 0 1rem; }
    .detalles p { margin: 0.5rem 0; color: var(--text); }
    .btn-reclamar { width: 100%; padding: 1rem; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 1rem; }
</style>