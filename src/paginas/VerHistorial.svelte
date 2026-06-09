<script>
    import { onMount } from 'svelte';
    import { getHistorialUsuario, actualizarEstado, eliminarObjeto, restaurarObjeto } from '../crud/objetos.js';
    
    // Variables
    let usuarioId = 1; // TODO: obtener del usuario logueado
    let objetos = [];
    let cargando = true;
    let mensaje = '';
    let objetoSeleccionado = null;
    let mostrandoModal = false;
    let filtroEstado = 'todos';
    
    // Categorías para filtro
    const estados = ['todos', 'pendiente', 'reclamado', 'entregado'];
    
    // Cargar al iniciar
    onMount(async () => {
        await cargarHistorial();
    });
    
    // Función para cargar el historial
    async function cargarHistorial() {
        cargando = true;
        mensaje = '';
        
        try {
            if (filtroEstado === 'todos') {
                objetos = await getHistorialUsuario(usuarioId);
            } else {
                // Filtrar por estado específico
                const todos = await getHistorialUsuario(usuarioId);
                objetos = todos.filter(o => o.estado === filtroEstado);
            }
        } catch (error) {
            console.error(error);
            mensaje = 'Error al cargar el historial';
        } finally {
            cargando = false;
        }
    }
    
    // Función para cambiar el estado
    async function cambiarEstado(id, nuevoEstado) {
        try {
            await actualizarEstado(id, nuevoEstado);
            mensaje = '✅ Estado actualizado correctamente';
            await cargarHistorial();
            cerrarModal();
        } catch (error) {
            console.error(error);
            mensaje = '❌ Error al actualizar el estado';
        }
    }
    
    // Función para eliminar
    async function eliminarPublicacion(id) {
        if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
        
        try {
            await eliminarObjeto(id);
            mensaje = '✅ Publicación eliminada';
            await cargarHistorial();
        } catch (error) {
            console.error(error);
            mensaje = '❌ Error al eliminar';
        }
    }
    
    // Función para restaurar
    async function restaurarPublicacion(id) {
        try {
            await restaurarObjeto(id);
            mensaje = '✅ Publicación restaurada';
            await cargarHistorial();
        } catch (error) {
            console.error(error);
            mensaje = '❌ Error al restaurar';
        }
    }
    
    // Funciones del modal
    function abrirOpciones(objeto) {
        objetoSeleccionado = objeto;
        mostrandoModal = true;
    }
    
    function cerrarModal() {
        mostrandoModal = false;
        objetoSeleccionado = null;
    }
    
    // Cambiar filtro
    function cambiarFiltro(nuevoFiltro) {
        filtroEstado = nuevoFiltro;
        cargarHistorial();
    }
    
    // Colores según estado
    function getColorEstado(estado) {
        switch (estado) {
            case 'pendiente': return '#22c55e';
            case 'reclamado': return '#eab308';
            case 'entregado': return '#3b82f6';
            case 'eliminado': return '#ef4444';
            default: return '#6b7280';
        }
    }
    
    // Formatear fecha
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        return new Date(fecha).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<div class="pagina">
    <h1>Mis Publicaciones</h1>
    
    <!-- Mensajes -->
    {#if mensaje}
        <div class="mensaje" class:error={mensaje.startsWith('❌')}>
            {mensaje}
        </div>
    {/if}
    
    <!-- Filtros -->
    <div class="filtros">
        {#each estados as estado}
            <button 
                class="filtro" 
                class:activo={filtroEstado === estado}
                on:click={() => cambiarFiltro(estado)}
            >
                {estado === 'todos' ? 'Todos' : estado}
            </button>
        {/each}
    </div>
    
    <!-- Contenido -->
    {#if cargando}
        <div class="cargando">Cargando publicaciones...</div>
    {:else if objetos.length === 0}
        <div class="vacio">
            <p>📭 No tienes publicaciones con este filtro</p>
            <a href="/publicar" class="boton">Publicar un objeto</a>
        </div>
    {:else}
        <div class="lista">
            {#each objetos as objeto}
                <div class="tarjeta">
                    {#if objeto.foto}
                        <img src={objeto.foto} alt={objeto.titulo} class="imagen" />
                    {:else}
                        <div class="sin-foto">📦</div>
                    {/if}
                    
                    <div class="contenido">
                        <h3>{objeto.titulo}</h3>
                        <p class="categoria">{objeto.categoria}</p>
                        <p class="ubicacion">📍 {objeto.ubicacion}</p>
                        <p class="fecha">📅 {formatearFecha(objeto.fechaPublicacion)}</p>
                        
                        <span class="estado" style="background: {getColorEstado(objeto.estado)}">
                            {objeto.estado}
                        </span>
                    </div>
                    
                    <div class="acciones">
                        <button class="btn-opciones" on:click={() => abrirOpciones(objeto)}>
                            ⋮
                        </button>
                    </div>
                </div>
            {/each}
        </div>
        
        <div class="total">
            {objetos.length} publicación(es)
        </div>
    {/if}
</div>

<!-- Modal de opciones -->
{#if mostrandoModal && objetoSeleccionado}
    <div class="modal-fondo" on:click={cerrarModal}>
        <div class="modal" on:click|stopPropagation>
            <h2>Opciones</h2>
            <p class="titulo-objeto">{objetoSeleccionado.titulo}</p>
            
            <div class="opciones">
                {#if objetoSeleccionado.estado === 'pendiente'}
                    <button class="btn-opcion" on:click={() => cambiarEstado(objetoSeleccionado.id, 'reclamado')}>
                        ✅ Marcar como Reclamado
                    </button>
                    <button class="btn-opcion" on:click={() => cambiarEstado(objetoSeleccionado.id, 'entregado')}>
                        📦 Marcar como Entregado
                    </button>
                {:else if objetoSeleccionado.estado === 'reclamado'}
                    <button class="btn-opcion" on:click={() => cambiarEstado(objetoSeleccionado.id, 'entregado')}>
                        ✅ Confirmar Entrega
                    </button>
                    <button class="btn-opcion" on:click={() => cambiarEstado(objetoSeleccionado.id, 'pendiente')}>
                        ↩ Cancelar Reclamo
                    </button>
                {:else if objetoSeleccionado.estado === 'entregado'}
                    <button class="btn-opcion" on:click={() => cambiarEstado(objetoSeleccionado.id, 'archivado')}>
                        🗄️ Archivar
                    </button>
                {/if}
                
                <button class="btn-opcion eliminar" on:click={() => eliminarPublicacion(objetoSeleccionado.id)}>
                    🗑️ Eliminar Publicación
                </button>
            </div>
            
            <button class="btn-cerrar" on:click={cerrarModal}>Cerrar</button>
        </div>
    </div>
{/if}

<style>
    .pagina {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    h1 {
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .mensaje {
        padding: 0.75rem;
        border-radius: 4px;
        background: var(--accent-bg);
        color: var(--accent);
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .mensaje.error {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .filtros {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1.5rem;
    }
    
    .filtro {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--text);
        cursor: pointer;
        text-transform: capitalize;
    }
    
    .filtro.activo {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
    }
    
    .cargando, .vacio {
        text-align: center;
        padding: 3rem;
        color: var(--text);
    }
    
    .boton {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: var(--accent);
        color: white;
        border-radius: 4px;
        text-decoration: none;
    }
    
    .lista {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .tarjeta {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg);
        align-items: center;
    }
    
    .imagen {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 6px;
    }
    
    .sin-foto {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--code-bg);
        border-radius: 6px;
        font-size: 2rem;
    }
    
    .contenido {
        flex: 1;
    }
    
    .contenido h3 {
        margin: 0 0 0.25rem;
    }
    
    .categoria {
        color: var(--text);
        font-size: 0.9rem;
        margin: 0;
        text-transform: capitalize;
    }
    
    .ubicacion, .fecha {
        color: var(--text);
        font-size: 0.85rem;
        margin: 0.25rem 0 0;
    }
    
    .estado {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        color: white;
        font-size: 0.75rem;
        text-transform: capitalize;
        margin-top: 0.5rem;
    }
    
    .acciones {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn-opciones {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--accent);
        color: white;
        border: none;
        cursor: pointer;
    }
    
    .total {
        text-align: center;
        margin-top: 1rem;
        color: var(--text);
    }
    
    /* Modal */
    .modal-fondo {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal {
        background: var(--bg);
        padding: 1.5rem;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
    }
    
    .modal h2 {
        margin: 0 0 0.5rem;
    }
    
    .titulo-objeto {
        color: var(--text);
        margin-bottom: 1rem;
    }
    
    .opciones {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn-opcion {
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--text);
        cursor: pointer;
        text-align: left;
    }
    
    .btn-opcion:hover {
        background: var(--code-bg);
    }
    
    .btn-opcion.eliminar {
        border-color: #ef4444;
        color: #ef4444;
    }
    
    .btn-cerrar {
        width: 100%;
        padding: 0.75rem;
        margin-top: 1rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--text);
        cursor: pointer;
    }
</style>