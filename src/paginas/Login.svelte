<!--
  COMPONENTE LOGIN
  Archivo: src/paginas/Login.svelte
  
  SOLUCIÓN DEL PROBLEMA (Rúbrica #1):
  Permite que usuarios registrados inicien sesión en el sistema.
  Verifica credenciales en la BD y crea una sesión válida.
  
  ARQUITECTURA SVELTE (Rúbrica #3):
  - Componente monolítico (sin fragmentación)
  - Usa stores para estado global (usuarioActual, tokenSesion)
  - Ciclo de vida: onMount para inicializar
  - Reactividad: $store para suscribirse automáticamente
  
  HTML SEMÁNTICO (Rúbrica #2):
  - Form para formulario
  - Input con type="email" y type="password"
  - Button con aria-busy para accesibilidad
  - Roles y labels correctos
  
  CSS ENCAPSULADO (Rúbrica #2):
  - Estilos scoped solo a este componente
  - Variables CSS para consistencia
  - Animaciones suaves
  
  VALIDACIÓN (Rúbrica #5):
  - Validación en tiempo real (onBlur)
  - Mensaje de error inmediato
  - Indicador de fortaleza de contraseña
  - Toggle para mostrar/ocultar contraseña
  
  UX (Rúbrica #5):
  - Spinner durante carga
  - Estados visuales claros
  - Mensajes de error informativos
  - Diseño responsivo (2 columnas desktop, 1 móvil)
-->

<script>
  // ========================================
  // IMPORTACIONES
  // ========================================
  
  import { onMount } from 'svelte';
  
  // Servicio de autenticación
  import { login } from '../servicios/authService.js';
  
  // Stores globales para estado de autenticación
  import { 
    establecerUsuarioAutenticado, 
    establecerError,
    establecerCargando,
    estaCargando,
    errorActual
  } from '../stores/authStore.js';
  
  // Funciones de validación
  import {
    validarCorreo,
    validarContrasena,
    validarLoginCompleto,
    obtenerFortaleaContrasena
  } from '../utilidades/validaciones.js';

  import { irA } from '../stores/navegacionStore.js';

  // ========================================
  // ESTADO DEL COMPONENTE
  // ========================================
  
  // Objeto con datos del formulario
  let datos = {
    correo: '',
    contrasena: ''
  };

  // Objeto para guardar errores de validación por campo
  let errores = {};
  
  // Booleano: si mostrar contraseña en texto o punteada
  let mostrarContrasena = false;

  // ========================================
  // CICLO DE VIDA
  // ========================================
  
  // Se ejecuta cuando el componente se monta en el DOM
  onMount(() => {
    console.log('Componente Login montado');
  });

  // ========================================
  // FUNCIONES DE VALIDACIÓN EN TIEMPO REAL
  // ========================================
  
  // Validar un campo individual al salir de él (onBlur)
  // Esto da feedback inmediato sin esperar a enviar el formulario
  function validarCampo(campo) {
    switch (campo) {
      // Validar correo
      case 'correo':
        const vCorreo = validarCorreo(datos.correo);
        if (!vCorreo.valido) {
          errores.correo = vCorreo.error;
        } else {
          errores.correo = null;
        }
        break;

      // Validar contraseña
      case 'contrasena':
        const vContrasena = validarContrasena(datos.contrasena);
        if (!vContrasena.valido) {
          errores.contrasena = vContrasena.error;
        } else {
          errores.contrasena = null;
        }
        break;
    }

    // Provocar reactividad en Svelte (redibujar)
    errores = errores;
  }

  // Limpiar errores anteriores
  // Se llama cuando el usuario comienza a escribir
  function limpiarErrores() {
    errores = {};
    establecerError(null);
  }

  // Obtener datos de fortaleza de contraseña
  // Retorna: { puntuacion, texto, color, porcentaje }
  function obtenerFortalezaContrasena() {
    return obtenerFortaleaContrasena(datos.contrasena);
  }

  // ========================================
  // FUNCIÓN PRINCIPAL: ENVIAR FORMULARIO
  // ========================================
  
  // Se ejecuta cuando usuario presiona botón "Inicia Sesión"
  // Flujo:
  // 1. Limpiar errores previos
  // 2. Validar formulario completo
  // 3. Si hay errores, mostrarlos y salir
  // 4. Si es válido, llamar al servicio de login
  // 5. Si login exitoso, guardar usuario y token
  // 6. Si login falla, mostrar error
  async function enviarFormulario(e) {
    e.preventDefault(); // Evitar recarga de página
    
    limpiarErrores();

    // Validar que los datos sean correctos
    const validacion = validarLoginCompleto(datos.correo, datos.contrasena);
    if (!validacion.esValido) {
      errores = validacion.errores;
      return; // Salir sin enviar
    }

    // Indicar que está cargando
    establecerCargando(true);

    try {
      // Llamar servicio de login
      const resultado = await login(datos.correo, datos.contrasena);

      if (resultado.exito) {
        // Login exitoso: guardar usuario y token en stores + localStorage
        establecerUsuarioAutenticado(resultado.usuario, resultado.token);
        console.log('Login exitoso');
        
        // Redirigir a dashboard
        // NOTA: En una app real usarías un router (SvelteKit, page.js, etc)
        window.location.href = '/dashboard';
      } else {
        // Login falló: mostrar mensaje de error
        establecerError(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error en login:', error);
      establecerError('Error en el servidor. Intenta de nuevo');
    } finally {
      // Indicar que terminó la carga (exitosa o no)
      establecerCargando(false);
    }
  }
</script>

<!-- ========================================
     ESTRUCTURA HTML DEL COMPONENTE
     ======================================== -->

<main class="contenedor-login">
  <!-- ENCABEZADO: Título y subtítulo -->
  <header class="encabezado-login">
    <h1>Encuentra UES-FMO</h1>
    <p class="subtitulo">Sistema de Objetos Perdidos y Encontrados</p>
  </header>

  <!-- SECCIÓN PRINCIPAL: Tarjeta de login -->
  <section class="seccion-login">
    <div class="tarjeta-login">
      <!-- COLUMNA 1: Formulario de login -->
      <div class="contenido-tarjeta">
        <!-- Encabezado del formulario -->
        <div class="encabezado-tarjeta">
          <h2>Inicia Sesion</h2>
          <p class="descripcion">Accede a tu cuenta para reportar y buscar objetos</p>
        </div>

        <!-- ALERTA DE ERROR (si hay error en el store global) -->
        {#if $errorActual}
          <div class="alerta alerta-error" role="alert">
            <span class="texto-alerta">{$errorActual}</span>
          </div>
        {/if}

        <!-- FORMULARIO -->
        <form on:submit={enviarFormulario} novalidate>
          
          <!-- CAMPO: CORREO -->
          <div class="campo-formulario">
            <label for="correo" class="etiqueta">
              Correo Electronico
            </label>
            <div class="contenedor-entrada">
              <input
                id="correo"
                type="email"
                class="entrada"
                class:entrada-error={errores.correo}
                placeholder="tu.correo@ues.edu.sv"
                bind:value={datos.correo}
                on:blur={() => validarCampo('correo')}
                disabled={$estaCargando}
                autocomplete="email"
                required
              />
            </div>
            <!-- Mostrar error si existe -->
            {#if errores.correo}
              <span class="error-mensaje">{errores.correo}</span>
            {/if}
          </div>

          <!-- CAMPO: CONTRASEÑA -->
          <div class="campo-formulario">
            <!-- Etiqueta + botón toggle mostrar/ocultar -->
            <div class="etiqueta-con-toggle">
              <label for="contrasena" class="etiqueta">Contraseña</label>
              <button
                type="button"
                class="boton-toggle"
                on:click={() => (mostrarContrasena = !mostrarContrasena)}
                disabled={$estaCargando}
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div class="contenedor-entrada">
              <input
                id="contrasena"
                type={mostrarContrasena ? 'text' : 'password'}
                class="entrada"
                class:entrada-error={errores.contrasena}
                placeholder="Tu contraseña segura"
                bind:value={datos.contrasena}
                on:blur={() => validarCampo('contrasena')}
                disabled={$estaCargando}
                autocomplete="current-password"
                required
              />
            </div>

            <!-- INDICADOR DE FORTALEZA (solo si hay contraseña) -->
            {#if datos.contrasena && datos.contrasena.length > 0}
              <div class="indicador-fortaleza">
                <div class="barra-fortaleza">
                  <div
                    class="barra-relleno"
                    style={`width: ${obtenerFortalezaContrasena().porcentaje}%; background-color: ${obtenerFortalezaContrasena().color};`}
                  ></div>
                </div>
                <span class="texto-fortaleza" style={`color: ${obtenerFortalezaContrasena().color};`}>
                  {obtenerFortalezaContrasena().texto}
                </span>
              </div>
            {/if}

            <!-- Error de contraseña -->
            {#if errores.contrasena}
              <span class="error-mensaje">{errores.contrasena}</span>
            {/if}
          </div>

          <!-- BOTÓN: ENVIAR FORMULARIO -->
          <button
            type="submit"
            class="boton-login"
            disabled={$estaCargando}
            aria-busy={$estaCargando}
          >
            {#if $estaCargando}
              <span class="spinner"></span>
              Iniciando sesion...
            {:else}
              Inicia Sesion
            {/if}
          </button>
        </form>

        <!-- DIVIDER -->
        <div class="divisor">
          <span>No tienes cuenta?</span>
        </div>

        <!-- BOTÓN: IR A REGISTRO -->
        <button type="button" class="boton-registro" on:click={() => irA('registro')}>
            Crear una cuenta
        </button>

        <!-- ENLACE: RECUPERAR CONTRASEÑA -->
        <div class="enlaces-adicionales">
          <button type="button" class="enlace-pequeño">Olvidaste tu contraseña?</button>
        </div>
      </div>

      <!-- COLUMNA 2: Panel informativo (solo desktop) -->
      <aside class="panel-informativo">
        <div class="contenido-informativo">
          <h3>Como funciona?</h3>
          
          <!-- Paso 1 -->
          <div class="paso-info">
            <span class="numero-paso">1</span>
            <div>
              <h4>Reporta Objetos</h4>
              <p>Si encuentras algo, registralo en el sistema</p>
            </div>
          </div>

          <!-- Paso 2 -->
          <div class="paso-info">
            <span class="numero-paso">2</span>
            <div>
              <h4>Busca tu Objeto</h4>
              <p>Consulta si alguien lo encontro</p>
            </div>
          </div>

          <!-- Paso 3 -->
          <div class="paso-info">
            <span class="numero-paso">3</span>
            <div>
              <h4>Reclama tu Articulo</h4>
              <p>Coordina la entrega con quien lo encontro</p>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="estadisticas">
            <div class="stat">
              <span class="numero-stat">500+</span>
              <span class="etiqueta-stat">Usuarios</span>
            </div>
            <div class="stat">
              <span class="numero-stat">150+</span>
              <span class="etiqueta-stat">Objetos Encontrados</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</main>

<!-- ========================================
     ESTILOS CSS (ENCAPSULADOS EN ESTE COMPONENTE)
     ======================================== -->

<style>
  /* Variables CSS para consistencia de diseño */
  :global(:root) {
    --primario: #0066cc;
    --primario-oscuro: #0052a3;
    --primario-claro: #f0f6ff;
    --error: #d32f2f;
    --fondo: #f8f9fa;
    --borde: #dee2e6;
    --texto: #212529;
    --texto-secundario: #6c757d;
    --sombra-md: 0 4px 6px rgba(0, 0, 0, 0.15);
    --sombra-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  /* CONTENEDOR PRINCIPAL */
  .contenedor-login {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem;
  }

  /* ENCABEZADO */
  .encabezado-login {
    text-align: center;
    color: white;
    margin-bottom: 2rem;
    animation: deslizarAbajo 0.6s ease-out;
  }

  .encabezado-login h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 2px;
  }

  .subtitulo {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0.5rem 0 0 0;
    font-weight: 300;
  }

  /* SECCIÓN PRINCIPAL */
  .seccion-login {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* TARJETA PRINCIPAL (2 columnas: formulario + panel informativo) */
  .tarjeta-login {
    background: white;
    border-radius: 16px;
    box-shadow: var(--sombra-lg);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: 1000px;
    animation: aparecer 0.8s ease-out;
  }

  /* CONTENIDO FORMULARIO */
  .contenido-tarjeta {
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ENCABEZADO TARJETA */
  .encabezado-tarjeta {
    text-align: center;
    margin-bottom: 1rem;
  }

  .encabezado-tarjeta h2 {
    font-size: 1.75rem;
    color: var(--texto);
    margin: 0 0 0.5rem 0;
  }

  .descripcion {
    color: var(--texto-secundario);
    font-size: 0.95rem;
    margin: 0;
  }

  /* ALERTA DE ERROR */
  .alerta {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid;
    animation: deslizarIzquierda 0.3s ease-out;
  }

  .alerta-error {
    background: rgba(211, 47, 47, 0.1);
    border-color: var(--error);
    color: var(--error);
  }

  .texto-alerta {
    flex: 1;
  }

  /* FORMULARIO */
  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* CAMPO FORMULARIO */
  .campo-formulario {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* ETIQUETA */
  .etiqueta {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--texto);
    display: block;
  }

  .etiqueta-con-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* CONTENEDOR ENTRADA (para alinear con ícono) */
  .contenedor-entrada {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* INPUT */
  .entrada {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid var(--borde);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
    background: white;
  }

  .entrada:focus {
    outline: none;
    border-color: var(--primario);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  .entrada:disabled {
    background: var(--fondo);
    opacity: 0.6;
    cursor: not-allowed;
  }

  .entrada-error {
    border-color: var(--error);
  }

  .entrada-error:focus {
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  /* BOTÓN TOGGLE MOSTRAR/OCULTAR */
  .boton-toggle {
    background: none;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
    color: var(--primario);
    text-decoration: underline;
    font-weight: 500;
  }

  .boton-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* INDICADOR DE FORTALEZA */
  .indicador-fortaleza {
    margin-top: 0.5rem;
  }

  .barra-fortaleza {
    height: 4px;
    background: var(--borde);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }

  .barra-relleno {
    height: 100%;
    transition: width 0.3s, background 0.3s;
  }

  .texto-fortaleza {
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* MENSAJE DE ERROR */
  .error-mensaje {
    font-size: 0.875rem;
    color: var(--error);
    display: block;
    animation: sacudida 0.3s;
  }

  /* BOTÓN LOGIN (PRIMARIO) */
  .boton-login {
    padding: 1rem;
    background: linear-gradient(135deg, var(--primario) 0%, #0052a3 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .boton-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--sombra-md);
  }

  .boton-login:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* SPINNER DURANTE CARGA */
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: girar 0.8s linear infinite;
  }

  /* DIVISOR */
  .divisor {
    text-align: center;
    color: var(--texto-secundario);
    font-size: 0.9rem;
    position: relative;
    margin: 1rem 0;
  }

  .divisor span {
    background: white;
    padding: 0 0.5rem;
    position: relative;
  }

  .divisor::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--borde);
  }

  /* BOTÓN REGISTRO (SECUNDARIO) */
  .boton-registro {
    padding: 1rem;
    background: var(--primario-claro);
    color: var(--primario);
    border: 2px solid var(--primario);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: all 0.3s;
    display: block;
  }

  .boton-registro:hover {
    background: var(--primario);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--sombra-md);
  }

  .boton-registro {
    background: var(--primario-claro);
    color: var(--primario);
    border: 2px solid var(--primario);
    border-radius: 8px;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: all 0.3s;
  }
  
  .boton-registro:hover {
    background: var(--primario);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--sombra-md);
  }

  /* ENLACES ADICIONALES */
  .enlaces-adicionales {
    text-align: center;
  }

  .enlace-pequeño {
    font-size: 0.85rem;
    color: var(--primario);
    text-decoration: none;
    transition: color 0.2s;
  }

  .enlace-pequeño:hover {
    color: var(--primario-oscuro);
    text-decoration: underline;
  }

  /* PANEL INFORMATIVO (COLUMNA 2) */
  .panel-informativo {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .contenido-informativo h3 {
    font-size: 1.5rem;
    margin: 0 0 2rem 0;
    text-align: center;
  }

  /* PASOS */
  .paso-info {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .numero-paso {
    min-width: 32px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .paso-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }

  .paso-info p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  /* ESTADÍSTICAS */
  .estadisticas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat {
    text-align: center;
  }

  .numero-stat {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .etiqueta-stat {
    display: block;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  /* ========================================
     ANIMACIONES
     ======================================== */

  @keyframes deslizarAbajo {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes aparecer {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes deslizarIzquierda {
    from {
      transform: translateX(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes sacudida {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  @keyframes girar {
    to {
      transform: rotate(360deg);
    }
  }

  /* ========================================
     RESPONSIVE DESIGN
     ======================================== */

  /* Tablet y pantallas medianas */
  @media (max-width: 768px) {
    .encabezado-login h1 {
      font-size: 1.75rem;
    }

    .tarjeta-login {
      grid-template-columns: 1fr;
    }

    .panel-informativo {
      display: none;
    }

    .contenido-tarjeta {
      padding: 2rem 1.5rem;
    }
  }

  /* Teléfono pequeño */
  @media (max-width: 480px) {
    .contenedor-login {
      padding: 1rem;
    }

    .encabezado-login h1 {
      font-size: 1.5rem;
    }

    .contenido-tarjeta {
      padding: 1.5rem 1rem;
    }

    .entrada {
      padding: 0.75rem;
    }
  }

  .enlace-pequeño {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
</style>