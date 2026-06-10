<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let paginaActual = 'inicio';
    
    function ir(pagina, ruta) {
        window.history.pushState({}, '', ruta);
        dispatch('cambiar', { pagina, ruta });
    }
</script>

<nav class="navbar">
    <div class="logo" on:click={() => ir('inicio', '/')}>
        🔍 Encuentra UES
    </div>
    
    <div class="menu">
        <button 
            class="nav-btn" 
            class:activo={paginaActual === 'inicio'}
            on:click={() => ir('inicio', '/')}
        >
            🏠 Inicio
        </button>
        
        <button 
            class="nav-btn" 
            class:activo={paginaActual === 'publicar'}
            on:click={() => ir('publicar', '/publicar')}
        >
            ➕ Publicar
        </button>
        
        <button 
            class="nav-btn" 
            class:activo={paginaActual === 'historial'}
            on:click={() => ir('historial', '/historial')}
        >
            📋 Mis Publicaciones
        </button>
        
        <button 
            class="nav-btn" 
            class:activo={paginaActual === 'login'}
            on:click={() => ir('login', '/login')}
        >
            🔑 Login
        </button>
    </div>
</nav>

<style>
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    .logo {
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        color: var(--accent);
    }
    
    .menu {
        display: flex;
        gap: 0.5rem;
    }
    
    .nav-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .nav-btn:hover {
        background: var(--code-bg);
    }
    
    .nav-btn.activo {
        background: var(--accent);
        color: white;
    }
</style>