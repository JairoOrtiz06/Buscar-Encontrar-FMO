<script>
  import { onMount } from 'svelte';
  import Navbar from '../componentes/Navbar.svelte';
  import Footer from '../componentes/Footer.svelte';
  import { dbPromise } from '../base_datos/database.js';
  import { irA } from '../stores/navegacionStore.js';
  import { usuarioActual, actualizarUsuarioActual } from '../stores/authStore.js';
  import {
    validarNombre,
    validarCorreo,
    validarTelefono,
    validarDUI
  } from '../utilidades/validaciones.js';

  let cargando = true;
  let guardando = false;
  let mensaje = '';
  let tipoMensaje = 'info';
  let errores = {};
  let usuarioCompleto = null;
  let idUsuarioSesion = null;
  let fotoPerfil = '';
  let nuevaFotoPerfil = '';

  let datos = {
    nombre: '',
    correo: '',
    telefono: '',
    dui: ''
  };

  onMount(async () => {
    await cargarPerfil();
  });

  async function cargarPerfil() {
    cargando = true;
    mensaje = '';

    try {
      const idSesion = obtenerIdUsuarioSesion();

      if (!idSesion && !$usuarioActual?.correo) {
        mensaje = 'No hay una sesion activa.';
        tipoMensaje = 'danger';
        return;
      }

      const db = await dbPromise;
      usuarioCompleto = idSesion
        ? await db.get('usuarios', idSesion)
        : null;

      if (!usuarioCompleto && $usuarioActual?.correo) {
        usuarioCompleto = await db.getFromIndex(
          'usuarios',
          'correo',
          normalizarCorreo($usuarioActual.correo)
        );
      }

      if (!usuarioCompleto) {
        mensaje = 'No se encontro la informacion del usuario.';
        tipoMensaje = 'danger';
        return;
      }

      idUsuarioSesion = usuarioCompleto.id;

      datos = {
        nombre: usuarioCompleto.nombre || '',
        correo: usuarioCompleto.correo || '',
        telefono: usuarioCompleto.telefono || '',
        dui: usuarioCompleto.dui || ''
      };

      const fotos = await db.getAllFromIndex('fotos', 'idUsuario', idUsuarioSesion);
      const perfil = fotos.find((foto) => foto.tipo === 'perfil');
      fotoPerfil = perfil?.base64 || '';
      nuevaFotoPerfil = '';
    } catch (error) {
      console.error(error);
      mensaje = 'Error al cargar el perfil.';
      tipoMensaje = 'danger';
    } finally {
      cargando = false;
    }
  }

  function validarFormulario() {
    const nuevosErrores = {};

    const validNombre = validarNombre(datos.nombre);
    if (!validNombre.valido) nuevosErrores.nombre = validNombre.error;

    const validCorreo = validarCorreo(datos.correo);
    if (!validCorreo.valido) nuevosErrores.correo = validCorreo.error;

    const validTelefono = validarTelefono(datos.telefono);
    if (!validTelefono.valido) nuevosErrores.telefono = validTelefono.error;

    const validDUI = validarDUI(datos.dui);
    if (!validDUI.valido) nuevosErrores.dui = validDUI.error;

    errores = nuevosErrores;
    return Object.keys(nuevosErrores).length === 0;
  }

  function normalizarCorreo(correo) {
    return String(correo || '').trim().toLowerCase();
  }

  function normalizarDUI(dui) {
    return String(dui || '').trim();
  }

  function obtenerIdUsuarioSesion() {
    return $usuarioActual?.id ?? $usuarioActual?.idUsuario ?? idUsuarioSesion;
  }

  function esUsuarioActual(usuario) {
    return String(usuario.id) === String(obtenerIdUsuarioSesion());
  }

  async function validarDuplicados(db) {
    const usuarios = await db.getAll('usuarios');
    const correoNormalizado = normalizarCorreo(datos.correo);
    const duiNormalizado = normalizarDUI(datos.dui);
    const erroresDuplicados = {};

    const correoExiste = usuarios.some((usuario) =>
      !esUsuarioActual(usuario) &&
      normalizarCorreo(usuario.correo) === correoNormalizado
    );

    if (correoExiste) {
      erroresDuplicados.correo = 'Ya existe otro usuario con ese correo.';
    }

    const duiExiste = usuarios.some((usuario) =>
      !esUsuarioActual(usuario) &&
      normalizarDUI(usuario.dui) === duiNormalizado
    );

    if (duiExiste) {
      erroresDuplicados.dui = 'Ya existe otro usuario con ese DUI.';
    }

    if (Object.keys(erroresDuplicados).length > 0) {
      errores = { ...errores, ...erroresDuplicados };
      return false;
    }

    return true;
  }

  function manejarFoto(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
      mensaje = 'La foto debe ser JPG o PNG.';
      tipoMensaje = 'danger';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      mensaje = 'La foto debe pesar menos de 5MB.';
      tipoMensaje = 'danger';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      nuevaFotoPerfil = String(lector.result || '');
      mensaje = '';
    };
    lector.readAsDataURL(archivo);
  }

  async function guardarPerfil() {
    mensaje = '';
    tipoMensaje = 'info';

    if (!validarFormulario()) return;

    guardando = true;

    try {
      const db = await dbPromise;
      const puedeGuardar = await validarDuplicados(db);
      if (!puedeGuardar) return;

      const usuario = await db.get('usuarios', obtenerIdUsuarioSesion());
      if (!usuario) {
        mensaje = 'No se encontro el usuario para actualizar.';
        tipoMensaje = 'danger';
        return;
      }

      const usuarioActualizado = {
        ...usuario,
        nombre: datos.nombre.trim(),
        correo: normalizarCorreo(datos.correo),
        telefono: datos.telefono.trim(),
        dui: normalizarDUI(datos.dui)
      };

      await db.put('usuarios', usuarioActualizado);

      if (nuevaFotoPerfil) {
        const fotos = await db.getAllFromIndex('fotos', 'idUsuario', obtenerIdUsuarioSesion());
        const fotoExistente = fotos.find((foto) => foto.tipo === 'perfil');

        if (fotoExistente) {
          await db.put('fotos', {
            ...fotoExistente,
            base64: nuevaFotoPerfil,
            fechaSubida: new Date().toISOString()
          });
        } else {
          await db.add('fotos', {
            idUsuario: obtenerIdUsuarioSesion(),
            tipo: 'perfil',
            base64: nuevaFotoPerfil,
            fechaSubida: new Date().toISOString()
          });
        }

        fotoPerfil = nuevaFotoPerfil;
        nuevaFotoPerfil = '';
      }

      actualizarUsuarioActual({
        nombre: usuarioActualizado.nombre,
        correo: usuarioActualizado.correo,
        fotoPerfil
      });

      mensaje = 'Perfil actualizado correctamente.';
      tipoMensaje = 'success';
      setTimeout(() => irA('inicio'), 1200);
    } catch (error) {
      console.error(error);
      mensaje = 'Error al actualizar el perfil.';
      tipoMensaje = 'danger';
    } finally {
      guardando = false;
    }
  }
</script>

<main class="perfil-layout">
  <Navbar paginaActual="perfil" />

  <section class="perfil-main">
    <article class="perfil-card">
      <div class="perfil-header">
        <p class="eyebrow">Mi cuenta</p>
        <h1>Editar perfil</h1>
        <p>Actualiza tu informacion personal y foto de perfil.</p>
      </div>

      {#if cargando}
        <div class="state-card">Cargando perfil...</div>
      {:else}
        {#if mensaje}
          <div class={`alert alert-${tipoMensaje}`}>{mensaje}</div>
        {/if}

        <div class="perfil-body">
          <aside class="foto-panel">
            <div class="foto-preview">
              {#if nuevaFotoPerfil || fotoPerfil}
                <img src={nuevaFotoPerfil || fotoPerfil} alt="Foto de perfil" />
              {:else}
                <span>Sin foto</span>
              {/if}
            </div>

            <label for="fotoPerfil" class="foto-label">Cambiar foto</label>
            <input
              id="fotoPerfil"
              type="file"
              accept="image/jpeg,image/png"
              on:change={manejarFoto}
              disabled={guardando}
            />

            <p class="foto-help">Formatos permitidos: JPG o PNG. Maximo 5MB.</p>
          </aside>

          <form class="perfil-form" on:submit|preventDefault={guardarPerfil}>
            <div class="form-group">
              <label for="nombre">Nombre completo</label>
              <input
                id="nombre"
                class:error={errores.nombre}
                type="text"
                bind:value={datos.nombre}
                disabled={guardando}
              />
              {#if errores.nombre}<span class="error-text">{errores.nombre}</span>{/if}
            </div>

            <div class="form-group">
              <label for="correo">Correo institucional</label>
              <input
                id="correo"
                class:error={errores.correo}
                type="email"
                bind:value={datos.correo}
                disabled={guardando}
              />
              {#if errores.correo}<span class="error-text">{errores.correo}</span>{/if}
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="telefono">Telefono</label>
                <input
                  id="telefono"
                  class:error={errores.telefono}
                  type="tel"
                  bind:value={datos.telefono}
                  disabled={guardando}
                  maxlength="9"
                />
                {#if errores.telefono}<span class="error-text">{errores.telefono}</span>{/if}
              </div>

              <div class="form-group">
                <label for="dui">DUI</label>
                <input
                  id="dui"
                  class:error={errores.dui}
                  type="text"
                  bind:value={datos.dui}
                  disabled={guardando}
                  maxlength="10"
                />
                {#if errores.dui}<span class="error-text">{errores.dui}</span>{/if}
              </div>
            </div>

            <div class="readonly-grid">
              <div>
                <span>Tipo de usuario</span>
                <strong>{usuarioCompleto?.tipo || 'No disponible'}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{usuarioCompleto?.estado || 'No disponible'}</strong>
              </div>
            </div>

            <button type="submit" class="btn-guardar" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      {/if}
    </article>
  </section>

  <Footer />
</main>

<style>
  .perfil-layout {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #f1f3f5;
  }

  .perfil-main {
    flex: 1;
    width: min(1050px, 94%);
    margin: clamp(1rem, 3vw, 2.2rem) auto;
  }

  :global(.inicio-footer) {
    margin-top: auto;
  }

  .perfil-card {
    overflow: hidden;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.1);
  }

  .perfil-header {
    padding: clamp(1.2rem, 3vw, 1.8rem);
    background: #990c14;
    color: #fff;
    text-align: center;
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .perfil-header h1 {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.3rem);
    font-weight: 900;
  }

  .perfil-header p {
    margin: 0.45rem 0 0;
    color: #fee2e2;
  }

  .perfil-body {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: clamp(1rem, 3vw, 2rem);
    padding: clamp(1.2rem, 3vw, 2rem);
  }

  .foto-panel {
    display: grid;
    align-content: start;
    gap: 0.8rem;
  }

  .foto-preview {
    display: grid;
    place-items: center;
    width: 180px;
    height: 180px;
    margin: 0 auto;
    overflow: hidden;
    border: 4px solid #990c14;
    border-radius: 50%;
    background: #f8fafc;
    color: #6b7280;
    font-weight: 800;
  }

  .foto-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .foto-label,
  .btn-guardar {
    display: inline-flex;
    justify-content: center;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-weight: 900;
    cursor: pointer;
  }

  .foto-label {
    border: 1px solid #990c14;
    color: #990c14;
    background: #fff;
  }

  input[type='file'] {
    width: 100%;
  }

  .foto-help {
    margin: 0;
    color: #6b7280;
    font-size: 0.86rem;
    text-align: center;
  }

  .perfil-form {
    display: grid;
    gap: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .form-group {
    display: grid;
    gap: 0.42rem;
    text-align: left;
  }

  .form-group label {
    color: #1f2937;
    font-weight: 800;
  }

  .form-group input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 0.78rem 0.85rem;
    color: #111827;
    background: #fff;
  }

  .form-group input:focus {
    outline: none;
    border-color: #990c14;
    box-shadow: 0 0 0 3px rgba(153, 12, 20, 0.14);
  }

  .form-group input.error {
    border-color: #b91c1c;
  }

  .error-text {
    color: #b91c1c;
    font-size: 0.84rem;
    font-weight: 700;
  }

  .readonly-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .readonly-grid div {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0.85rem;
    background: #f9fafb;
  }

  .readonly-grid span {
    display: block;
    color: #6b7280;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .readonly-grid strong {
    display: block;
    margin-top: 0.25rem;
    color: #990c14;
    text-transform: capitalize;
  }

  .btn-guardar {
    border: 0;
    background: #990c14;
    color: #fff;
  }

  .btn-guardar:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .alert,
  .state-card {
    margin: 1rem;
    border-radius: 10px;
    padding: 0.9rem 1rem;
    font-weight: 800;
    text-align: center;
  }

  .state-card {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #374151;
  }

  .alert-info {
    border: 1px solid #bae6fd;
    background: #f0f9ff;
    color: #075985;
  }

  .alert-success {
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }

  .alert-danger {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  @media (max-width: 768px) {
    .perfil-body,
    .form-row,
    .readonly-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
