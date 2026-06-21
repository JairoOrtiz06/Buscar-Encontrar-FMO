<script>
    const anio = new Date().getFullYear();
</script>

<footer class="footer">
    <div class="contenido">
        <p class="titulo">🔍 Encuentra UES</p>
        <p class="descripcion">Recupera tus objetos perdidos en la Universidad de El Salvador</p>
        
        <div class="enlaces">
            <a href="/">Inicio</a>
            <a href="/publicar">Publicar</a>
            <a href="/login">Login</a>
        </div>
        
        <p class="copyright">
            © {anio} Encuentra UES - Todos los derechos reservados
        </p>
    </div>
</footer>

<style>
    .footer {
        padding: 2rem 1.5rem;
        background: var(--code-bg);
        border-top: 1px solid var(--border);
        margin-top: auto;
    }
    
    .contenido {
        max-width: 1100px;
        margin: 0 auto;
        text-align: center;
    }
    
    .titulo {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0 0 0.5rem;
        color: var(--accent);
    }
    
    .descripcion {
        color: var(--text);
        font-size: 0.9rem;
        margin: 0 0 1rem;
    }
    
    .enlaces {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-bottom: 1rem;
    }
    
    .enlaces a {
        color: var(--text);
        text-decoration: none;
        font-size: 0.9rem;
    }
    
    .enlaces a:hover {
        color: var(--accent);
    }
    
    .copyright {
        font-size: 0.8rem;
        color: var(--text);
        opacity: 0.7;
        margin: 0;
    }
</style>