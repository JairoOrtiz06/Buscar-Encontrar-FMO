# Encuentra UES

Sistema web para publicar, buscar y reclamar objetos perdidos o encontrados dentro de la UES-FMO. La aplicacion permite registrar usuarios, iniciar sesion, publicar objetos, consultar objetos disponibles, gestionar reclamos, revisar historial y administrar informacion desde un panel interno.

## Tecnologias utilizadas

- Svelte 5
- Vite
- JavaScript
- Bootstrap 5
- IndexedDB con `idb`
- `face-api.js` para validaciones de imagen
- `tesseract.js` para lectura OCR

## Requisitos

Antes de ejecutar el proyecto necesitas tener instalado:

- Node.js
- npm

Puedes verificarlo con:

```bash
node -v
npm -v
```

## Instalacion

Clona o descarga el proyecto y entra a la carpeta:

```bash
cd Buscar-Encontrar-FMO
```

Instala las dependencias:

```bash
npm install
```

## Ejecutar en modo desarrollo

Para levantar el servidor local de desarrollo:

```bash
npm run dev
```

Luego abre en el navegador la URL que muestre la terminal, normalmente:

```text
http://localhost:5173
```

## Crear version de produccion

Para generar los archivos finales optimizados:

```bash
npm run build
```

Los archivos generados quedaran en la carpeta `dist`.

## Previsualizar la version de produccion

Despues de compilar el proyecto, puedes probar la version generada con:

```bash
npm run preview
```

## Estructura general

```text
Buscar-Encontrar-FMO/
|-- public/              # Archivos publicos y recursos estaticos
|-- src/
|   |-- base_datos/      # Configuracion y manejo de IndexedDB
|   |-- componentes/     # Componentes reutilizables
|   |-- crud/            # Funciones para crear, leer, actualizar y eliminar datos
|   |-- paginas/         # Pantallas principales de la aplicacion
|   |-- servicios/       # Servicios de imagen, OCR y registro
|   |-- stores/          # Estados globales de Svelte
|   |-- App.svelte       # Componente principal y control de vistas
|   `-- main.js          # Punto de entrada de la aplicacion
|-- package.json         # Dependencias y scripts del proyecto
`-- vite.config.js       # Configuracion de Vite
```

## Funcionalidades principales

- Registro e inicio de sesion de usuarios.
- Publicacion de objetos encontrados.
- Busqueda de objetos registrados.
- Reclamo de objetos por parte de usuarios.
- Historial de publicaciones y reclamos.
- Perfil de usuario.
- Panel de administracion.
- Validaciones con imagen y OCR para apoyar el registro.

## Scripts disponibles

| Comando | Descripcion |
| --- | --- |
| `npm install` | Instala las dependencias del proyecto. |
| `npm run dev` | Ejecuta la aplicacion en modo desarrollo. |
| `npm run build` | Genera la version final para produccion. |
| `npm run preview` | Previsualiza la version compilada. |

## Notas

- La aplicacion usa almacenamiento local del navegador mediante IndexedDB.
- Algunos servicios de validacion de imagen pueden requerir conexion a internet para cargar modelos externos.
- Si cambias dependencias, vuelve a ejecutar `npm install`.
