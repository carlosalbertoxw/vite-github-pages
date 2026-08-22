import { readFileSync, readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { defineConfig } from 'vite'

// En GitHub Pages el sitio se publica en https://<usuario>.github.io/<repo>/,
// asi que los assets deben resolverse contra /<repo>/.
// En desarrollo (npm run dev) usamos '/' para que funcione en http://localhost:5173/
const repo = 'vite-github-pages'

const raiz = import.meta.dirname

// --- Entradas del sitio (MPA) -------------------------------------------------
// Cada .html de la raiz es una pagina independiente que Vite compila por su cuenta.
// Al ser paginas reales, GitHub Pages puede servir /servicios.html sin ningun truco.
// Añadir una pagina = crear el .html; no hay que tocar esta config.
const paginas = Object.fromEntries(
  readdirSync(raiz)
    .filter((archivo) => archivo.endsWith('.html'))
    .map((archivo) => [basename(archivo, '.html'), resolve(raiz, archivo)]),
)

// --- Plugin: partials de HTML -------------------------------------------------
// Sustituye `<!-- include: header -->` por el contenido de partials/header.html.
// Asi la cabecera y el pie se escriben una sola vez.
//
// Corre con order 'pre', antes del procesado de assets de Vite, para que las rutas
// que vengan dentro del partial tambien reciban el prefijo de `base`.
function partialsHtml() {
  const cache = new Map()

  const leer = (nombre) => {
    if (!cache.has(nombre)) {
      cache.set(nombre, readFileSync(resolve(raiz, 'partials', `${nombre}.html`), 'utf-8'))
    }
    return cache.get(nombre)
  }

  return {
    name: 'partials-html',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const paginaActual = basename(ctx.filename)

        return html.replace(/<!--\s*include:\s*([\w-]+)\s*-->/g, (_, nombre) => {
          // Marca el enlace de la pagina actual en el menu (estilo + accesibilidad).
          return leer(nombre).replaceAll(
            `data-pagina="${paginaActual}"`,
            `data-pagina="${paginaActual}" aria-current="page"`,
          )
        })
      },
    },

    // Los partials no forman parte del grafo de modulos, asi que hay que
    // recargar a mano cuando cambian.
    handleHotUpdate({ file, server }) {
      if (file.includes('partials')) {
        cache.clear()
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repo}/` : '/',
  plugins: [partialsHtml()],
  build: {
    rollupOptions: { input: paginas },
  },
}))
