import { writable } from 'svelte/store';

// Página actual: 'login', 'registro' o 'inicio'
export const paginaActual = writable('login');

export function irA(pagina) {
    paginaActual.set(pagina);
}

export default {
    paginaActual,
    irA
};