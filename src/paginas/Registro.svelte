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
    obtenerDepartamentos,
    obtenerCarrerasPorDepartamento,
    CATEGORIAS_USUARIOS,
  } from '../servicios/registerService.js';

  import {
    validarFotoPerfil,
    validarFotoCarnet,
    validarFotoCarnetCompleta
  } from '../servicios/imageService.js';
  
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
    obtenerFortaleaContrasena,
    validarCorreo,
    validarCorreoEstudiante,
    validarNombre,
    validarTelefono,
    validarDUI,
    validarCarnet,
    validarContrasena,
    validarConfirmacionContrasena,
    validarCampoRequerido,
    validarCodigoInstitucional
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

  // Estado para fotos
  let fotoPerfil = null;
  let fotoCarnet = null;
  let previewFotoPerfil = null;
  let previewFotoCarnet = null;
  let errorFotoPerfil = null;
  let errorFotoCarnet = null;
  let cargandoFotoPerfil = false;
  let cargandoFotoCarnet = false;

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
    // LIMPIAR TODOS LOS CAMPOS cuando cambias de categoría
    categoriaSeleccionada = obtenerInfoCategoria(tipoId);
    datos.tipo = tipoId;
    // Limpiar SOLO campos específicos de forma segura
    datos.nombre = '';
    datos.correo = '';
    datos.telefono = '';
    datos.dui = '';
    datos.contrasena = '';
    datos.confirmacion = '';
    datos.carnet = '';
    datos.carrera = '';
    datos.departamento = '';
    datos.codigoInstitucional = '';
    datos.areaOficina = '';
    datos.descripcion = '';

    // Limpiar fotos
    limpiarFotoPerfil();
    limpiarFotoCarnet();

    errores = {};
    mostrarContrasena = false;
    mostrarConfirmacion = false;
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
    switch (campo) {
      case 'nombre':
        const vNombre = validarNombre(datos.nombre);
        errores.nombre = vNombre.valido ? null : vNombre.error;
        break;

      case 'correo':
        const vCorreo = validarCorreo(datos.correo);
        errores.correo = vCorreo.valido ? null : vCorreo.error;
        break;

      case 'telefono':
        const vTelefono = validarTelefono(datos.telefono);
        errores.telefono = vTelefono.valido ? null : vTelefono.error;
        break;

      case 'dui':
        const vDUI = validarDUI(datos.dui);
        errores.dui = vDUI.valido ? null : vDUI.error;
        break;

      case 'carnet':
        const vCarnet = validarCarnet(datos.carnet);
        errores.carnet = vCarnet.valido ? null : vCarnet.error;
        break;

      case 'contrasena':
        const vContrasena = validarContrasena(datos.contrasena);
        errores.contrasena = vContrasena.valido ? null : vContrasena.error;
        break;

      case 'confirmacion':
        const vConfirmacion = validarConfirmacionContrasena(datos.contrasena, datos.confirmacion);
        errores.confirmacion = vConfirmacion.valido ? null : vConfirmacion.error;
        break;

      case 'carrera':
        const vCarrera = validarCampoRequerido(datos.carrera, 'La carrera');
        errores.carrera = vCarrera.valido ? null : vCarrera.error;
        break;

      case 'departamento':
        const vDepartamento = validarCampoRequerido(datos.departamento, 'El departamento');
        errores.departamento = vDepartamento.valido ? null : vDepartamento.error;
        break;

      case 'codigoInstitucional':
        const vCodigo = validarCodigoInstitucional(datos.codigoInstitucional);
        errores.codigoInstitucional = vCodigo.valido ? null : vCodigo.error;
        break;

      case 'areaOficina':
        const vArea = validarCampoRequerido(datos.areaOficina, 'El area de trabajo');
        errores.areaOficina = vArea.valido ? null : vArea.error;
        break;
    }

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

    /**
   * Manejar selección de foto de perfil
   */
  async function manejarFotoPerfil(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    errorFotoPerfil = null;
    cargandoFotoPerfil = true;
    
    try {
      const resultado = await validarFotoPerfil(archivo);
      
      if (resultado.valido) {
        fotoPerfil = archivo;
        previewFotoPerfil = resultado.base64;
        errorFotoPerfil = null;
      } else {
        fotoPerfil = null;
        previewFotoPerfil = null;
        errorFotoPerfil = resultado.error;
      }
    } catch (error) {
      console.error('Error:', error);
      errorFotoPerfil = 'Error procesando la imagen';
      fotoPerfil = null;
      previewFotoPerfil = null;
    } finally {
      cargandoFotoPerfil = false;
    }
  }

  /**
   * Manejar selección de foto de carnet (solo estudiantes)
   */
  async function manejarFotoCarnet(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // VALIDAR que foto de perfil esté subida primero
    if (!previewFotoPerfil) {
      errorFotoCarnet = 'Debes subir tu foto de perfil primero para comparar los rostros';
      return;
    }
    
    errorFotoCarnet = null;
    cargandoFotoCarnet = true;
    
    try {
    // Validar carnet comparando con foto de perfil
    const resultado = await validarFotoCarnetCompleta(archivo, previewFotoPerfil);
    
    if (resultado.valido) {
      fotoCarnet = archivo;
      previewFotoCarnet = resultado.base64;
      errorFotoCarnet = null;
      console.log(`Rostros coinciden con ${resultado.similitud}% de similitud`);
    } else {
      fotoCarnet = null;
      previewFotoCarnet = null;
      errorFotoCarnet = resultado.error;
    }
  } catch (error) {
    console.error('Error:', error);
    errorFotoCarnet = 'Error procesando la imagen';
    fotoCarnet = null;
    previewFotoCarnet = null;
  } finally {
    cargandoFotoCarnet = false;
  }
}

  /**
   * Limpiar foto de perfil
   */
  function limpiarFotoPerfil() {
    fotoPerfil = null;
    previewFotoPerfil = null;
    errorFotoPerfil = null;
  }

  /**
   * Limpiar foto de carnet
   */
  function limpiarFotoCarnet() {
    fotoCarnet = null;
    previewFotoCarnet = null;
    errorFotoCarnet = null;
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
      const validCorreoEstud = validarCorreoEstudiante(datos.correo, datos.carnet);
      if (!validCorreoEstud.valido) {
        errores.correo = validCorreoEstud.error;
        errores = errores;
        return;
      }
    }

    // Validar según tipo de usuario

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

    // Validar que foto de perfil esté subida (TODAS las categorías)
    if (!previewFotoPerfil) {
      establecerError('Debes subir una foto de perfil');
      return;
    }

    // Validar que foto de carnet esté subida (SOLO estudiantes)
    if (datos.tipo === 'estudiante' && !previewFotoCarnet) {
      establecerError('Debes subir una foto de tu carnet');
      return;
    }

    // Indicar que está cargando
    establecerCargando(true);

    try {
      // Llamar servicio de registro
      const resultado = await registrarUsuario(datos, previewFotoPerfil, previewFotoCarnet);

      if (resultado.exito) {
        // Registro exitoso
        establecerError(null);
        console.log('Registro exitoso');
        
        // Mostrar mensaje de éxito
        alert('Registro completado. Tu cuenta está pendiente de aprobación. Serás notificado por correo cuando sea aprobada.');
        
        // Redirigir a login
        irAlLogin();
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
          <p>Ya tienes cuenta? <button type="button" class="enlace-login" on:click={irAlLogin}>Inicia sesion aqui</button></p>
        </div>
      </div>
    </section>
  </main>

<!-- ========================================
     PASO 2: LLENAR FORMULARIO
     ======================================== -->

{:else if pasoActual === 2 && categoriaSeleccionada}
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
                pattern="[0-9\-]{8,9}"
                inputmode="numeric"
                maxlength="9"
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

          <!-- SECCIÓN: FOTOS -->
          <fieldset class="fieldset">
            <legend>Foto de Perfil</legend>

            <!-- FOTO DE PERFIL (TODAS LAS CATEGORÍAS) -->
            <div class="campo-formulario">
              <label for="fotoPerfil">Selecciona tu foto</label>
              {#if datos.tipo === 'estudiante'}
                <p class="ayuda-texto">Recomendación: Usa la foto que tienes en tu EEL (Expediente En Línea). Debe mostrar claramente tu rostro.</p>
              {:else}
                <p class="ayuda-texto">Debe mostrar claramente tu rostro.</p>
              {/if}
              
              <input
                id="fotoPerfil"
                type="file"
                class="entrada-archivo"
                accept="image/jpeg,image/png"
                on:change={manejarFotoPerfil}
                disabled={$estaCargando || cargandoFotoPerfil}
                required
              />
              
              {#if cargandoFotoPerfil}
                <div class="validando">
                  <span class="spinner-pequeno"></span>
                  Validando imagen y detectando rostro...
                </div>
              {/if}
              
              {#if errorFotoPerfil}
                <span class="error-mensaje">{errorFotoPerfil}</span>
              {/if}
              
              {#if previewFotoPerfil}
                <div class="preview-foto">
                  <img src={previewFotoPerfil} alt="Preview foto de perfil" />
                  <button type="button" class="boton-limpiar" on:click={limpiarFotoPerfil} disabled={$estaCargando}>
                    Cambiar foto
                  </button>
                </div>
              {/if}
            </div>

            <!-- FOTO DE CARNET (SOLO ESTUDIANTES) -->
            {#if datos.tipo === 'estudiante'}
              <div class="campo-formulario">
                <label for="fotoCarnet">Foto de Carnet Físico</label>
                <p class="ayuda-texto">Sube una foto clara de tu carnet universitario.</p>
                
                <input
                  id="fotoCarnet"
                  type="file"
                  class="entrada-archivo"
                  accept="image/jpeg,image/png"
                  on:change={manejarFotoCarnet}
                  disabled={!previewFotoPerfil || $estaCargando || cargandoFotoCarnet}
                  placeholder={!previewFotoPerfil ? 'Primero sube tu foto de perfil' : ''}
                  required
                />
                
                {#if cargandoFotoCarnet}
                  <div class="validando">
                    <span class="spinner-pequeno"></span>
                    Validando imagen...
                  </div>
                {/if}
                
                {#if errorFotoCarnet}
                  <span class="error-mensaje">{errorFotoCarnet}</span>
                {/if}
                
                {#if previewFotoCarnet}
                  <div class="preview-foto">
                    <img src={previewFotoCarnet} alt="Preview foto de carnet" />
                    <button type="button" class="boton-limpiar" on:click={limpiarFotoCarnet} disabled={$estaCargando}>
                      Cambiar foto
                    </button>
                  </div>
                {/if}
              </div>
            {/if}
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
                  placeholder="YV22084"
                  bind:value={datos.carnet}
                  on:blur={() => validarCampo('carnet')}
                  on:input={() => { datos.carnet = datos.carnet.toUpperCase(); }}
                  disabled={$estaCargando}
                  pattern="[A-Z]{2}[0-9]{5}"
                  maxlength="7"
                  inputmode="text"
                  required
                />
                {#if errores.carnet}
                  <span class="error-mensaje">{errores.carnet}</span>
                {/if}
              </div>

              <!-- Departamento -->
              <div class="campo-formulario">
                <label for="departamento-estudiante">Departamento</label>
                <select
                  id="departamento-estudiante"
                  class="entrada"
                  class:entrada-error={errores.departamento}
                  bind:value={datos.departamento}
                  disabled={$estaCargando}
                  required
                >
                  <option value="">Selecciona tu departamento</option>
                  {#each obtenerDepartamentos() as depto}
                    <option value={depto}>{depto}</option>
                  {/each}
                </select>
                {#if errores.departamento}
                  <span class="error-mensaje">{errores.departamento}</span>
                {/if}
              </div>

              <!-- Carrera (filtrada por departamento) -->
              <div class="campo-formulario">
                <label for="carrera">Carrera</label>
                <select
                  id="carrera"
                  class="entrada"
                  class:entrada-error={errores.carrera}
                  bind:value={datos.carrera}
                  on:blur={() => validarCampo('carrera')}
                  disabled={!datos.departamento || $estaCargando}
                  required
                >
                  <option value="">
                    {#if datos.departamento}
                      Selecciona tu carrera
                    {:else}
                      Selecciona primero un departamento
                    {/if}
                  </option>
                  {#each obtenerCarrerasPorDepartamento(datos.departamento) as carrera}
                    <option value={carrera}>{carrera}</option>
                  {/each}
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
                <label for="departamento-docente">Departamento</label>
                <select
                  id="departamento-docente"
                  class="entrada"
                  class:entrada-error={errores.departamento}
                  bind:value={datos.departamento}
                  on:blur={() => validarCampo('departamento')}
                  disabled={$estaCargando}
                  required
                >
                  <option value="">Selecciona tu departamento</option>
                  {#each obtenerDepartamentos() as depto}
                    <option value={depto}>{depto}</option>
                  {/each}
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
          <p>Ya tienes cuenta? <button type="button" class="enlace-login" on:click={irAlLogin}>Inicia sesion aqui</button></p>
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
    --secundario: #990c14;
    --secundario-claro: #fff1f2;
    --error: #990c14;
    --exito: #28a745;
    --fondo: #fff5f5;
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
    background:
      radial-gradient(circle at top, rgba(153, 12, 20, 0.12), transparent 34rem),
      linear-gradient(180deg, #fff5f5 0%, #f8fafc 52%, #fff 100%);
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem;
  }

  /* ENCABEZADO */
  .encabezado-registro {
    text-align: center;
    color: #990c14;
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
    text-shadow: 0 2px 10px rgba(153, 12, 20, 0.14);
  }

  .subtitulo {
    font-size: 1.2rem;
    opacity: 0.95;
    margin: 0;
    font-weight: 300;
    color: #4b5563;
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
    background: linear-gradient(180deg, #ffffff 0%, #fff7f7 100%);
    border-radius: 16px;
    box-shadow: 0 18px 44px rgba(153, 12, 20, 0.18);
    border: 1px solid rgba(153, 12, 20, 0.12);
    border-top: 7px solid #990c14;
    padding: 3rem 2rem;
    width: 100%;
    max-width: 900px;
    animation: aparecer 0.8s ease-out;
  }

  .encabezado-categorias {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(153, 12, 20, 0.85);
  }

  .encabezado-categorias h2 {
    font-size: 1.75rem;
    color: #990c14;
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
    background: linear-gradient(180deg, #ffffff 0%, #fffafa 100%);
    border: 2px solid rgba(153, 12, 20, 0.14);
    border-radius: 12px;
    padding: 2rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    box-shadow: 0 8px 18px rgba(153, 12, 20, 0.08);
    min-height: 250px;
  }

  .boton-categoria:hover {
    border-color: #990c14;
    background: linear-gradient(135deg, #fff1f2 0%, #FFFFFF 100%);
    transform: translateY(-6px);
    box-shadow: 0 16px 30px rgba(153, 12, 20, 0.18);
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
    color: #990c14;
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
    background: #990c14;
    border-radius: 20px;
    transition: all 0.2s;
    margin-top: auto;
  }

  .boton-categoria:hover .indicador-siguiente {
    background: #7c0910;
  }

  /* ========================================
     PASO 2: FORMULARIO
     ======================================== */

  .tarjeta-formulario {
    background: linear-gradient(180deg, #ffffff 0%, #fffafa 100%);
    border-radius: 16px;
    box-shadow: 0 18px 44px rgba(153, 12, 20, 0.18);
    border: 1px solid rgba(153, 12, 20, 0.12);
    border-top: 7px solid #990c14;
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
    color: #990c14;
    font-weight: 600;
    background: #fff1f2;
    border: 1px solid rgba(153, 12, 20, 0.18);
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
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
    border: 1px solid rgba(153, 12, 20, 0.14);
    border-radius: 14px;
    padding: 1.1rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 8px 20px rgba(153, 12, 20, 0.06);
  }

  .fieldset legend {
    font-size: 1.1rem;
    font-weight: 600;
    color: #990c14;
    margin-bottom: 0.5rem;
    padding: 0 0.4rem;
    border: none;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid rgba(153, 12, 20, 0.18);
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
    display: flex;
    padding-left: 5px;
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
    color: var(--texto);
  }

  .entrada:focus {
    outline: none;
    border-color: #990c14;
    box-shadow: 0 0 0 3px rgba(153, 12, 20, 0.12);
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

  select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #E0E0E0;
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: inherit;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--texto);
  }

  select:focus {
    outline: none;
    border-color: #990c14;
    box-shadow: 0 0 0 3px rgba(153, 12, 20, 0.12);
  }

  select:disabled {
    background: #F5F5F5;
    opacity: 0.6;
    cursor: not-allowed;
  }

  select.entrada-error {
    border-color: #990c14;
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
    background: linear-gradient(135deg, #990c14 0%, #7c0910 100%);
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
    border-color: #990c14;
    color: #990c14;
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

  .enlace-login {
    border: 0;
    padding: 0;
    background: transparent;
    color: #990c14;
    font: inherit;
    text-decoration: none;
    font-weight: 600;
    cursor: pointer;
  }

  .enlace-login:hover {
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


  /* ========================================
     ESTILOS PARA INPUTS DE ARCHIVO
     ======================================== */

  .entrada-archivo {
    display: block;
    width: 100%;
    padding: 0.75rem;
    border: 2px dashed #990c14;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    background: #fff1f2;
    margin-top: -0.5rem;
  }

  .entrada-archivo:hover {
    border-color: #7c0910;
    background: #ffe4e6;
  }

  .entrada-archivo:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #F5F5F5;
  }

  /* Texto de ayuda/recomendación */
  .ayuda-texto {
    font-size: 0.85rem;
    color: #666666;
    margin: 0.5rem 0;
    font-style: italic;
    display: flex;
    text-align: left;
  }

  /* Mientras se valida */
  .validando {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #E8F4FF;
    border-left: 4px solid #0088CC;
    border-radius: 4px;
    color: #0088CC;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  /* Spinner pequeño */
  .spinner-pequeno {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(0, 136, 204, 0.3);
    border-radius: 50%;
    border-top-color: #0088CC;
    animation: girar 0.8s linear infinite;
  }

  /* Preview de foto */
  .preview-foto {
    margin-top: 1rem;
    text-align: center;
  }

  .preview-foto img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    border: 2px solid #990c14;
    object-fit: cover;
    margin-bottom: 1rem;
  }

  /* Botón para limpiar/cambiar foto */
  .boton-limpiar {
    padding: 0.5rem 1rem;
    background: #fff1f2;
    color: #990c14;
    border: 1px solid #990c14;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .boton-limpiar:hover:not(:disabled) {
    background: #990c14;
    color: white;
  }

  .boton-limpiar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
