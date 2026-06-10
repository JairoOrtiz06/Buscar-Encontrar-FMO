<script>
    import { createEventDispatcher, onMount } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let paginaActual = 'inicio';
    
    // Estado de usuario (simulado - depois lo harás con tu sistema de login)
    let usuarioLogueado = null;
    let cargando = true;
    
    onMount(async () => {
        // Cargar usuario del localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            try {
                usuarioLogueado = JSON.parse(usuarioGuardado);
            } catch (e) {
                usuarioLogueado = null;
            }
        }
        cargando = false;
    });
    
    // Función para navegar
    function ir(pagina, ruta, requiereAuth = false) {
        // Verificar si requiere login
        if (requiereAuth && !usuarioLogueado) {
            // Redirigir a login
            window.history.pushState({}, '', '/login');
            dispatch('cambiar', { pagina: 'login', ruta });
            return;
        }
        
        window.history.pushState({}, '', ruta);
        dispatch('cambiar', { pagina, ruta });
    }
    
    // Función para cerrar sesión
    function cerrarSesion() {
        localStorage.removeItem('usuario');
        usuarioLogueado = null;
        ir('inicio', '/');
    }
</script>

<nav class="navbar">
    <div class="logo" on:click={() => ir('inicio', '/')}>
        🔍 Encuentra UES
    </div>
    
    <div class="menu">
        <!-- Siempre visible -->
        <button 
            class="nav-btn" 
            class:activo={paginaActual === 'inicio'}
            on:click={() => ir('inicio', '/')}
        >
            🏠 Inicio
        </button>
        
        <!-- Solovisible si está logeado -->
        {#if usuarioLogueado}
            <button 
                class="nav-btn" 
                class:activo={paginaActual === 'publicar'}
                on:click={() => ir('publicar', '/publicar', true)}
            >
                ➕ Publicar
            </button>
            
            <button 
                class="nav-btn" 
                class:activo={paginaActual === 'historial'}
                on:click={() => ir('historial', '/historial', true)}
            >
                📋 Mis Publicaciones
            </button>
            
            <!-- Usuario logeado - mostrar nombre -->
            <div class="usuario-menu">
                <span class="usuario-nombre">👤 {usuarioLogueado.nombre || 'Usuario'}</span>
                <button class="btn-cerrar" on:click={cerrarSesion}>Salir</button>
            </div>
        {:else}
            <!-- No está logeado -->
            <button 
                class="nav-btn" 
                class:activo={paginaActual === 'login'}
                on:click={() => ir('login', '/login')}
            >
                🔑 Login
            </button>
            
            <button 
                class="nav-btn " 
                class:activo={paginaActual === 'registro'}
                on:click={() => ir('registro', '/registro')}
            >
                📝 Registrarse
            </button>
        {/if}
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
        align-items: center;
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
    
    .nav-btn.registro {
        background: var(--accent);
        color: white;
    }
    
    .usuario-menu {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .usuario-nombre {
        font-size: 0.9rem;
        color: var(--text);
    }
    
    .btn-cerrar {
        padding: 0.375rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        font-size: 0.8rem;
    }
    
    .btn-cerrar:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #dc2626;
    }
</style>