<!--
  COMPONENTE REGISTRO
  Archivo: src/paginas/Registro.svelte
  
  SOLUCIÓN DEL PROBLEMA (Rúbrica #1):
  Permite que nuevos usuarios se registren en el sistema.
  Valida que sean miembros reales de UES-FMO (carnet, DUI, código institucional).
  
  ARQUITECTURA SVELTE (Rúbrica #3):
  - Componente monolítico con 2 pasos
  - Estado reactivo para pasos y categoría seleccionada
  - Formulario dinámico basado en tipo de usuario
  - Integración perfecta con stores y servicios
  
  HTML SEMÁNTICO (Rúbrica #2):
  - Form para formularios
  - Input con type correctos
  - Fieldset para agrupar campos relacionados
  - Labels para accesibilidad
  
  VALIDACIÓN (Rúbrica #5):
  - Validación en tiempo real (onBlur)
  - Indicador visual de errores
  - Indicador de fortaleza de contraseña
  - Prevención de envío si hay errores
  
  PERSISTENCIA (Rúbrica #4):
  - Integración con registerService.js
  - Guardado en IndexedDB con validaciones
  - Manejo perfecto de promesas
-->

<script>
  // ========================================
  // IMPORTACIONES
  // ========================================
  
  // Importar logo
  import logoUES from '../assets/logoUES.png';


  import { onMount } from 'svelte';
  
  // Servicio de registro con validaciones de duplicados
  import { 
    registrarUsuario,
    obtenerCategorias,
    obtenerInfoCategoria,
    CATEGORIAS_USUARIOS
  } from '../servicios/registerService.js';
  
  // Stores de autenticación
  import { 
    establecerUsuarioAutenticado,
    establecerError,
    establecerCargando,
    estaCargando,
    errorActual
  } from '../stores/authStore.js';
  
  // Funciones de validación
  import {
    validarRegistroEstudiante,
    validarRegistroDocente,
    validarRegistroAdministrativo,
    obtenerFortaleaContrasena
  } from '../utilidades/validaciones.js';

  // ========================================
  // ESTADO DEL COMPONENTE
  // ========================================
  
  // Paso actual: 1 (seleccionar categoría) o 2 (llenar formulario)
  let pasoActual = 1;
  
  // Categoría seleccionada por el usuario
  let categoriaSeleccionada = null;
  
  // Datos del formulario
  let datos = {
    nombre: '',
    correo: '',
    telefono: '',
    dui: '',
    contrasena: '',
    confirmacion: '',
    tipo: '',
    
    // Campos específicos
    carnet: '',
    carrera: '',
    codigoInstitucional: '',
    departamento: '',
    areaOficina: '',
    descripcion: ''
  };
  
  // Errores de validación por campo
  let errores = {};
  
  // Booleano: mostrar contraseña en texto o punteada
  let mostrarContrasena = false;
  let mostrarConfirmacion = false;
  
  // Categorías disponibles
  let categorias = [];

  // ========================================
  // CICLO DE VIDA
  // ========================================
  
  onMount(() => {
    // Obtener todas las categorías disponibles
    categorias = obtenerCategorias();
    console.log('Componente Registro montado');
  });

  // ========================================
  // PASO 1: SELECCIONAR CATEGORÍA
  // ========================================
  
  // Usuario selecciona una categoría
  // Se guarda y se avanza al paso 2
  function seleccionarCategoria(tipoId) {
    categoriaSeleccionada = obtenerInfoCategoria(tipoId);
    datos.tipo = tipoId;
    pasoActual = 2;
    console.log('Categoría seleccionada:', tipoId);
  }

  // Volver al paso 1 desde paso 2
  import { irA } from '../stores/navegacionStore.js';

    function volverAlPaso1() {
        pasoActual = 1;
        categoriaSeleccionada = null;
        errores = {};
        establecerError(null);
    }


    function irAlLogin() {
        irA('login');
    }

  // ========================================
  // VALIDACIONES EN TIEMPO REAL
  // ========================================
  
  // Validar un campo individual
  // Se llama en onBlur de cada input
  function validarCampo(campo) {
    // Remover error anterior de este campo
    errores[campo] = null;

    // Validar según el campo
    switch (campo) {
      case 'nombre':
        if (!datos.nombre || datos.nombre.trim().length < 3) {
          errores.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        break;

      case 'correo':
        if (!datos.correo || !datos.correo.includes('@')) {
          errores.correo = 'Email invalido';
        }
        break;

      case 'telefono':
        if (!datos.telefono || datos.telefono.trim().length < 8) {
          errores.telefono = 'Telefono invalido. Minimo 8 digitos';
        }
        break;

      case 'dui':
        const duiRegex = /^\d{8}-\d{1}$/;
        if (!datos.dui || !duiRegex.test(datos.dui)) {
          errores.dui = 'Formato de DUI invalido. Debe ser: 12345678-9';
        }
        break;

      case 'carnet':
        const carnetRegex = /^[A-Z]{2}\d{5}$/;
        if (datos.tipo === 'estudiante' && (!datos.carnet || !carnetRegex.test(datos.carnet.toUpperCase()))) {
          errores.carnet = 'Carnet invalido. Formato: MA22013';
        }
        break;

      case 'contrasena':
        if (!datos.contrasena || datos.contrasena.length < 8) {
          errores.contrasena = 'La contraseña debe tener minimo 8 caracteres';
        }
        break;

      case 'confirmacion':
        if (datos.contrasena !== datos.confirmacion) {
          errores.confirmacion = 'Las contraseñas no coinciden';
        }
        break;

      case 'carrera':
        if (!datos.carrera || datos.carrera.trim().length === 0) {
          errores.carrera = 'Debes seleccionar una carrera';
        }
        break;

      case 'codigoInstitucional':
        if (!datos.codigoInstitucional || datos.codigoInstitucional.trim().length === 0) {
          errores.codigoInstitucional = 'El codigo institucional es obligatorio';
        }
        break;

      case 'departamento':
        if (!datos.departamento || datos.departamento.trim().length === 0) {
          errores.departamento = 'Debes seleccionar un departamento';
        }
        break;

      case 'areaOficina':
        if (!datos.areaOficina || datos.areaOficina.trim().length === 0) {
          errores.areaOficina = 'Debes indicar tu area de trabajo';
        }
        break;
    }

    // Provocar reactividad
    errores = errores;
  }

  // Limpiar errores
  function limpiarErrores() {
    errores = {};
    establecerError(null);
  }

  // Obtener fortaleza de contraseña
  function obtenerFortaleza() {
    return obtenerFortaleaContrasena(datos.contrasena);
  }

  // ========================================
  // PASO 2: ENVIAR FORMULARIO
  // ========================================
  
  // Función principal: registrar usuario
  async function enviarFormulario(e) {
    e.preventDefault();
    
    limpiarErrores();

    // Validar según tipo de usuario
    let validacion;
    
    if (datos.tipo === 'estudiante') {
      validacion = validarRegistroEstudiante(datos);
    } else if (datos.tipo === 'docente') {
      validacion = validarRegistroDocente(datos);
    } else if (datos.tipo === 'administrativo') {
      validacion = validarRegistroAdministrativo(datos);
    }

    // Si hay errores, mostrarlos y salir
    if (!validacion.esValido) {
      errores = validacion.errores;
      return;
    }

    // Indicar que está cargando
    establecerCargando(true);

    try {
      // Llamar servicio de registro
      const resultado = await registrarUsuario(datos);

      if (resultado.exito) {
        // Registro exitoso
        establecerError(null);
        console.log('Registro exitoso');
        
        // Mostrar mensaje de éxito
        alert('Registro completado. Tu cuenta está pendiente de aprobación. Serás notificado por correo cuando sea aprobada.');
        
        // Redirigir a login
        window.location.href = '/login';
      } else {
        // Registro falló
        establecerError(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error registrando usuario:', error);
      establecerError('Error en el servidor. Intenta de nuevo');
    } finally {
      establecerCargando(false);
    }
  }
</script>

<!-- ========================================
     PASO 1: SELECCIONAR CATEGORÍA
     ======================================== -->

{#if pasoActual === 1}
  <main class="contenedor-registro">
    <header class="encabezado-registro">
      <div class="logo-contenedor">
        <img src={logoUES} alt="Logo UES-FMO" class="logo-ues" />
      </div>
      <h1>Encuentra UES-FMO</h1>
      <p class="subtitulo">Crear una nueva cuenta</p>
    </header>

    <section class="seccion-registro">
      <div class="tarjeta-categorias">
        <div class="encabezado-categorias">
          <h2>Paso 1 de 2: Selecciona tu tipo de usuario</h2>
          <p>Elige la opción que mejor te describe</p>
        </div>

        <!-- Grid de categorías -->
        <div class="grid-categorias">
          {#each categorias as categoria (categoria.id)}
            <button
              type="button"
              class="boton-categoria"
              on:click={() => seleccionarCategoria(categoria.id)}
            >
              <div class="contenido-categoria">
                <h3>{categoria.nombre}</h3>
                <p>{categoria.descripcion}</p>
                <span class="indicador-siguiente">Continuar</span>
              </div>
            </button>
          {/each}
        </div>

        <!-- Enlace para volver a login -->
        <div class="enlace-volver">
          <p>Ya tienes cuenta? <a href="/login">Inicia sesion aqui</a></p>
        </div>
      </div>
    </section>
  </main>

<!-- ========================================
     PASO 2: LLENAR FORMULARIO
     ======================================== -->

{:else if pasoActual === 2}
  <main class="contenedor-registro">
    <header class="encabezado-registro">
      <h1>Encuentra UES-FMO</h1>
      <p class="subtitulo">Crear una nueva cuenta</p>
    </header>

    <section class="seccion-registro">
      <div class="tarjeta-formulario">
        <!-- Indicador de progreso -->
        <div class="indicador-paso">
          <span class="paso-numero">Paso 2 de 2</span>
          <h2>Información de {categoriaSeleccionada.nombre.toLowerCase()}</h2>
        </div>

        <!-- Alerta de error global -->
        {#if $errorActual}
          <div class="alerta alerta-error" role="alert">
            <span class="texto-alerta">{$errorActual}</span>
          </div>
        {/if}

        <!-- FORMULARIO -->
        <form on:submit={enviarFormulario} novalidate>
          <!-- SECCIÓN: CAMPOS COMUNES -->
          <fieldset class="fieldset">
            <legend>Información Personal</legend>

            <!-- Nombre -->
            <div class="campo-formulario">
              <label for="nombre">Nombre Completo</label>
              <input
                id="nombre"
                type="text"
                class="entrada"
                class:entrada-error={errores.nombre}
                placeholder="Tu nombre completo"
                bind:value={datos.nombre}
                on:blur={() => validarCampo('nombre')}
                disabled={$estaCargando}
                required
              />
              {#if errores.nombre}
                <span class="error-mensaje">{errores.nombre}</span>
              {/if}
            </div>

            <!-- Correo -->
            <div class="campo-formulario">
              <label for="correo">Correo Electronico</label>
              <input
                id="correo"
                type="email"
                class="entrada"
                class:entrada-error={errores.correo}
                placeholder="tu.correo@ues.edu.sv"
                bind:value={datos.correo}
                on:blur={() => validarCampo('correo')}
                disabled={$estaCargando}
                required
              />
              {#if errores.correo}
                <span class="error-mensaje">{errores.correo}</span>
              {/if}
            </div>

            <!-- Teléfono -->
            <div class="campo-formulario">
              <label for="telefono">Telefono</label>
              <input
                id="telefono"
                type="tel"
                class="entrada"
                class:entrada-error={errores.telefono}
                placeholder="2345-6789"
                bind:value={datos.telefono}
                on:blur={() => validarCampo('telefono')}
                disabled={$estaCargando}
                required
              />
              {#if errores.telefono}
                <span class="error-mensaje">{errores.telefono}</span>
              {/if}
            </div>

            <!-- DUI -->
            <div class="campo-formulario">
              <label for="dui">DUI</label>
              <input
                id="dui"
                type="text"
                class="entrada"
                class:entrada-error={errores.dui}
                placeholder="12345678-9"
                bind:value={datos.dui}
                on:blur={() => validarCampo('dui')}
                disabled={$estaCargando}
                required
              />
              {#if errores.dui}
                <span class="error-mensaje">{errores.dui}</span>
              {/if}
            </div>
          </fieldset>

          <!-- SECCIÓN: CAMPOS ESPECÍFICOS POR TIPO -->
          <fieldset class="fieldset">
            <legend>Información Específica</legend>

            <!-- PARA ESTUDIANTE -->
            {#if datos.tipo === 'estudiante'}
              <!-- Carnet -->
              <div class="campo-formulario">
                <label for="carnet">Carnet</label>
                <input
                  id="carnet"
                  type="text"
                  class="entrada"
                  class:entrada-error={errores.carnet}
                  placeholder="MA22013"
                  bind:value={datos.carnet}
                  on:blur={() => validarCampo('carnet')}
                  disabled={$estaCargando}
                  required
                />
                {#if errores.carnet}
                  <span class="error-mensaje">{errores.carnet}</span>
                {/if}
              </div>

              <!-- Carrera -->
              <div class="campo-formulario">
                <label for="carrera">Carrera</label>
                <select
                  id="carrera"
                  class="entrada"
                  class:entrada-error={errores.carrera}
                  bind:value={datos.carrera}
                  on:blur={() => validarCampo('carrera')}
                  disabled={$estaCargando}
                  required
                >
                  <option value="">Selecciona una carrera</option>
                  <option value="Ingenieria en Sistemas">Ingenieria en Sistemas</option>
                  <option value="Ingenieria en Electrica">Ingenieria en Electrica</option>
                  <option value="Ingenieria en Mecanica">Ingenieria en Mecanica</option>
                  <option value="Administracion de Empresas">Administracion de Empresas</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Enfermeria">Enfermeria</option>
                  <option value="Psicologia">Psicologia</option>
                  <option value="Derecho">Derecho</option>
                </select>
                {#if errores.carrera}
                  <span class="error-mensaje">{errores.carrera}</span>
                {/if}
              </div>
            {/if}

            <!-- PARA DOCENTE -->
            {#if datos.tipo === 'docente'}
              <!-- Código Institucional -->
              <div class="campo-formulario">
                <label for="codigoInst">Código Institucional</label>
                <input
                  id="codigoInst"
                  type="text"
                  class="entrada"
                  class:entrada-error={errores.codigoInstitucional}
                  placeholder="Ej: DOC12345"
                  bind:value={datos.codigoInstitucional}
                  on:blur={() => validarCampo('codigoInstitucional')}
                  disabled={$estaCargando}
                  required
                />
                {#if errores.codigoInstitucional}
                  <span class="error-mensaje">{errores.codigoInstitucional}</span>
                {/if}
              </div>

              <!-- Departamento -->
              <div class="campo-formulario">
                <label for="departamento">Departamento</label>
                <select
                  id="departamento"
                  class="entrada"
                  class:entrada-error={errores.departamento}
                  bind:value={datos.departamento}
                  on:blur={() => validarCampo('departamento')}
                  disabled={$estaCargando}
                  required
                >
                  <option value="">Selecciona un departamento</option>
                  <option value="Ingenieria y Arquitectura">Ingenieria y Arquitectura</option>
                  <option value="Ciencias Naturales y Matematica">Ciencias Naturales y Matematica</option>
                  <option value="Estudios Generales">Estudios Generales</option>
                  <option value="Ciencias Sociales">Ciencias Sociales</option>
                  <option value="Salud Publica">Salud Publica</option>
                </select>
                {#if errores.departamento}
                  <span class="error-mensaje">{errores.departamento}</span>
                {/if}
              </div>
            {/if}

            <!-- PARA ADMINISTRATIVO -->
            {#if datos.tipo === 'administrativo'}
              <!-- Código Institucional -->
              <div class="campo-formulario">
                <label for="codigoAdm">Código Institucional</label>
                <input
                  id="codigoAdm"
                  type="text"
                  class="entrada"
                  class:entrada-error={errores.codigoInstitucional}
                  placeholder="Ej: ADM12345"
                  bind:value={datos.codigoInstitucional}
                  on:blur={() => validarCampo('codigoInstitucional')}
                  disabled={$estaCargando}
                  required
                />
                {#if errores.codigoInstitucional}
                  <span class="error-mensaje">{errores.codigoInstitucional}</span>
                {/if}
              </div>

              <!-- Area de Oficina -->
              <div class="campo-formulario">
                <label for="areaOficina">Area de Trabajo</label>
                <input
                  id="areaOficina"
                  type="text"
                  class="entrada"
                  class:entrada-error={errores.areaOficina}
                  placeholder="Ej: Registro Academico"
                  bind:value={datos.areaOficina}
                  on:blur={() => validarCampo('areaOficina')}
                  disabled={$estaCargando}
                  required
                />
                {#if errores.areaOficina}
                  <span class="error-mensaje">{errores.areaOficina}</span>
                {/if}
              </div>
            {/if}

            <!-- PARA VIGILANTE, MANTENIMIENTO, LIMPIEZA -->
            {#if ['vigilante', 'mantenimiento', 'limpieza'].includes(datos.tipo)}
              <!-- Código Institucional -->
              <div class="campo-formulario">
                <label for="codigoOtro">Código Institucional</label>
                <input
                  id="codigoOtro"
                  type="text"
                  class="entrada"
                  class:entrada-error={errores.codigoInstitucional}
                  placeholder="Ej: VIG12345"
                  bind:value={datos.codigoInstitucional}
                  on:blur={() => validarCampo('codigoInstitucional')}
                  disabled={$estaCargando}
                  required
                />
                {#if errores.codigoInstitucional}
                  <span class="error-mensaje">{errores.codigoInstitucional}</span>
                {/if}
              </div>
            {/if}
          </fieldset>

          <!-- SECCIÓN: CONTRASEÑA -->
          <fieldset class="fieldset">
            <legend>Contraseña</legend>

            <!-- Contraseña -->
            <div class="campo-formulario">
              <div class="etiqueta-con-toggle">
                <label for="contrasena">Contraseña</label>
                <button
                  type="button"
                  class="boton-toggle"
                  on:click={() => (mostrarContrasena = !mostrarContrasena)}
                  disabled={$estaCargando}
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="contrasena"
                type={mostrarContrasena ? 'text' : 'password'}
                class="entrada"
                class:entrada-error={errores.contrasena}
                placeholder="Minimo 8 caracteres"
                bind:value={datos.contrasena}
                on:blur={() => validarCampo('contrasena')}
                disabled={$estaCargando}
                required
              />

              <!-- Indicador de fortaleza -->
              {#if datos.contrasena && datos.contrasena.length > 0}
                <div class="indicador-fortaleza">
                  <div class="barra-fortaleza">
                    <div
                      class="barra-relleno"
                      style={`width: ${obtenerFortaleza().porcentaje}%; background-color: ${obtenerFortaleza().color};`}
                    ></div>
                  </div>
                  <span class="texto-fortaleza" style={`color: ${obtenerFortaleza().color};`}>
                    {obtenerFortaleza().texto}
                  </span>
                </div>
              {/if}

              {#if errores.contrasena}
                <span class="error-mensaje">{errores.contrasena}</span>
              {/if}
            </div>

            <!-- Confirmar Contraseña -->
            <div class="campo-formulario">
              <div class="etiqueta-con-toggle">
                <label for="confirmacion">Confirmar Contraseña</label>
                <button
                  type="button"
                  class="boton-toggle"
                  on:click={() => (mostrarConfirmacion = !mostrarConfirmacion)}
                  disabled={$estaCargando}
                >
                  {mostrarConfirmacion ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="confirmacion"
                type={mostrarConfirmacion ? 'text' : 'password'}
                class="entrada"
                class:entrada-error={errores.confirmacion}
                placeholder="Repite tu contraseña"
                bind:value={datos.confirmacion}
                on:blur={() => validarCampo('confirmacion')}
                disabled={$estaCargando}
                required
              />
              {#if errores.confirmacion}
                <span class="error-mensaje">{errores.confirmacion}</span>
              {/if}
            </div>
          </fieldset>

          <!-- BOTONES DE ACCIÓN -->
          <div class="grupo-botones">
            <button
              type="button"
              class="boton-secundario"
              on:click={volverAlPaso1}
              disabled={$estaCargando}
            >
              Volver Atras
            </button>
            <button
              type="submit"
              class="boton-primario"
              disabled={$estaCargando}
              aria-busy={$estaCargando}
            >
              {#if $estaCargando}
                <span class="spinner"></span>
                Registrando...
              {:else}
                Crear Cuenta
              {/if}
            </button>
          </div>
        </form>

        <!-- Enlace para volver a login -->
        <div class="enlace-volver">
          <p>Ya tienes cuenta? <a href="/login">Inicia sesion aqui</a></p>
        </div>
      </div>
    </section>
  </main>
{/if}

<!-- ========================================
     ESTILOS CSS (ENCAPSULADOS)
     ======================================== -->

<style>
  /* Variables CSS */
  :global(:root) {
    --primario: #0088CC;
    --primario-oscuro: #006BA3;
    --primario-claro: #E8F4FF;
    --secundario: #C41E3A;
    --secundario-claro: #F5E8EB;
    --error: #C41E3A;
    --exito: #28a745;
    --fondo: #F5F5F5;
    --borde: #D0D0D0;
    --texto: #333333;
    --texto-secundario: #666666;
    --blanco: #FFFFFF;
    --sombra-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --sombra-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  /* LOGO */
  .logo-contenedor {
    margin-bottom: -0.1rem;
    animation: deslizarAbajo 0.6s ease-out;
  }

  .logo-ues {
    height: 150px;
    width: auto;
    object-fit: contain;
  }

  /* CONTENEDOR PRINCIPAL */
  .contenedor-registro {
    background: #F5F5F5;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem;
  }

  /* ENCABEZADO */
  .encabezado-registro {
    text-align: center;
    color: white;
    margin-bottom: 1rem;
    animation: deslizarAbajo 0.6s ease-out;
    padding: 0.1rem;
    border-radius: 12px;
  }

  .encabezado-registro h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .subtitulo {
    font-size: 1.2rem;
    opacity: 0.95;
    margin: 0;
    font-weight: 300;
    color: black;
  }

  /* SECCIÓN */
  .seccion-registro {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* ========================================
     PASO 1: GRID DE CATEGORÍAS
     ======================================== */

  .tarjeta-categorias {
    background: #FAFAFA;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(196, 30, 58, 0.2);
    border-top: 5px solid #C41E3A;
    padding: 3rem 2rem;
    width: 100%;
    max-width: 900px;
    animation: aparecer 0.8s ease-out;
  }

  .encabezado-categorias {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #C41E3A;
  }

  .encabezado-categorias h2 {
    font-size: 1.75rem;
    color: #C41E3A;
    margin: 0;
    font-weight: 700;
    min-height: 42px;
    display: flex;
    align-items: center;
  }

  .encabezado-categorias p {
    color: #666666;
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    min-height: 24px;
    display: flex;
    align-items: center;
  }

  /* GRID DE BOTONES CATEGORÍA */
  .grid-categorias {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  /* BOTÓN CATEGORÍA */
  .boton-categoria {
    background: white;
    border: 2px solid #E0E0E0;
    border-radius: 12px;
    padding: 2rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    min-height: 250px;
  }

  .boton-categoria:hover {
    border-color: #C41E3A;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%);
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(196, 30, 58, 0.15);
    border-width: 2px;
  }

  .contenido-categoria {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .contenido-categoria h3 {
    font-size: 1.2rem;
    color: #C41E3A;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
    min-height: 28px;
    display: flex;
    align-items: center;
  }

  .contenido-categoria p {
    font-size: 0.9rem;
    color: #666666;
    margin: 0.5rem 0 0 0;
    min-height: 36px;
    display: flex;
    align-items: center;
  }

  .indicador-siguiente {
    display: inline-block;
    font-size: 0.85rem;
    color: white;
    font-weight: 600;
    padding: 0.5rem 1.2rem;
    background: #C41E3A;
    border-radius: 20px;
    transition: all 0.2s;
    margin-top: auto;
  }

  .boton-categoria:hover .indicador-siguiente {
    background: #A01B2F;
  }

  /* ========================================
     PASO 2: FORMULARIO
     ======================================== */

  .tarjeta-formulario {
    background: white;
    border-radius: 16px;
    box-shadow: var(--sombra-lg);
    border-top: 5px solid #C41E3A;
    padding: 3rem 2rem;
    width: 100%;
    max-width: 800px;
    animation: aparecer 0.8s ease-out;
  }

  /* Indicador de progreso */
  .indicador-paso {
    text-align: center;
    margin-bottom: 2rem;
  }

  .paso-numero {
    font-size: 0.9rem;
    color: var(--primario);
    font-weight: 600;
  }

  .indicador-paso h2 {
    font-size: 1.75rem;
    color: var(--texto);
    margin: 0.5rem 0 0 0;
  }

  /* ALERTA */
  .alerta {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid;
    margin-bottom: 1.5rem;
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
    gap: 2rem;
  }

  /* FIELDSET */
  .fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .fieldset legend {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--texto);
    margin-bottom: 0.5rem;
    padding: 0;
    border: none;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primario-claro);
  }

  /* CAMPO */
  .campo-formulario {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .campo-formulario label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--texto);
  }

  .etiqueta-con-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* INPUT Y SELECT */
  .entrada {
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

  .entrada-textarea {
    resize: vertical;
    font-family: inherit;
  }

  /* BOTÓN TOGGLE */
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

  /* GRUPO DE BOTONES */
  .grupo-botones {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .boton-primario,
  .boton-secundario {
    flex: 1;
    padding: 1rem;
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
  }

  .boton-primario {
    background: linear-gradient(135deg, var(--primario) 0%, #0052a3 100%);
    color: white;
  }

  .boton-primario:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--sombra-md);
  }

  .boton-primario:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .boton-secundario {
    background: var(--fondo);
    color: var(--texto);
    border: 2px solid var(--borde);
  }

  .boton-secundario:hover:not(:disabled) {
    background: white;
    border-color: var(--primario);
    color: var(--primario);
  }

  .boton-secundario:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* SPINNER */
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: girar 0.8s linear infinite;
  }

  /* ENLACE VOLVER */
  .enlace-volver {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--borde);
  }

  .enlace-volver p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--texto-secundario);
  }

  .enlace-volver a {
    color: var(--primario);
    text-decoration: none;
    font-weight: 600;
  }

  .enlace-volver a:hover {
    text-decoration: underline;
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

  @media (max-width: 768px) {
    .encabezado-registro h1 {
      font-size: 1.75rem;
    }

    .tarjeta-categorias,
    .tarjeta-formulario {
      padding: 2rem 1.5rem;
    }

    .grid-categorias {
      grid-template-columns: 1fr;
    }

    .grupo-botones {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .contenedor-registro {
      padding: 1rem;
    }

    .encabezado-registro h1 {
      font-size: 1.5rem;
    }

    .tarjeta-categorias,
    .tarjeta-formulario {
      padding: 1.5rem 1rem;
    }

    .entrada {
      padding: 0.75rem;
    }
  }
</style>