import { writable } from 'svelte/store';

// Página actual: 'login', 'registro', 'admin-register' o 'inicio'
export const paginaActual = writable('inicio');

export function irA(pagina) {
    paginaActual.set(pagina);
}

export default {
    paginaActual,
    irA
};