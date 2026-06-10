<script>
    import Navbar from './componentes/Navbar.svelte';
    import Footer from './componentes/Footer.svelte';
    import Inicio from './paginas/Inicio.svelte';
    import PublicarObjeto from './paginas/PublicarObjeto.svelte';
    import Historial from './paginas/VerHistorial.svelte';
    import Login from './paginas/Login.svelte';
    
    let paginaActual = 'inicio';
    
    function handleCambiar(event) {
        paginaActual = event.detail.pagina;
    }
</script>

<div class="app">
    <Navbar {paginaActual} on:cambiar={handleCambiar} />
    
    <main class="contenido">
        {#if paginaActual === 'inicio'}
            <Inicio />
        {:else if paginaActual === 'publicar'}
            <PublicarObjeto />
        {:else if paginaActual === 'historial'}
            <Historial />
        {:else if paginaActual === 'login'}
            <Login />
        {:else}
            <Inicio />
        {/if}
    </main>
    
    <Footer />
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .contenido {
        flex: 1;
    }
</style>