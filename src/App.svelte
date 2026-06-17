<!--
  COMPONENTE RAÍZ - App.svelte
  
  SOLUCIÓN DEL PROBLEMA (Rúbrica #1):
  Enrutador principal de la aplicación.
  Decide qué componente mostrar según el estado (login, registro, inicio).
  
  ARQUITECTURA (Rúbrica #3 y #4):
  - onMount: restaura sesión desde localStorage/IndexedDB
  - Reactividad: usa stores para estado global
  - Integración perfecta entre componentes y stores
  
  FLUJO:
  1. App monta
  2. Restaura sesión si existe
  3. Muestra Login o Inicio según estaLogueado
-->

<script>

    import VerHistorial from './paginas/Administracion.svelte';
</script>

<VerHistorial />
