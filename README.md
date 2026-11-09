# vite-github-pages

Sitio web estático de varias páginas construido con [Vite](https://vite.dev) y desplegado en
GitHub Pages mediante GitHub Actions.

El contenido es el de una empresa ficticia llamada **Cauce** (analítica operativa): nombres,
clientes, cifras y testimonios son de relleno, pensados para servir de plantilla.

## Requisitos

- Node.js 24 (la versión está fijada en `.nvmrc`; Vite 8 admite desde Node 20.19)
- Una cuenta de GitHub

## Uso local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

Otros comandos:

- `npm run build` — genera el sitio estático en `dist/`
- `npm run preview` — sirve `dist/` localmente para revisar el resultado del build

## Páginas

| Archivo | Contenido |
| --- | --- |
| `index.html` | Portada: hero, ventajas, proceso, métricas, testimonio |
| `servicios.html` | Cuatro servicios en detalle, integraciones, alcance |
| `precios.html` | Tres planes con conmutador mensual/anual, comparativa y FAQ |
| `casos.html` | Tres casos de éxito con contexto, solución y resultados |
| `contacto.html` | Formulario validado, datos de contacto y FAQ |
| `404.html` | Página de error, servida sola por GitHub Pages |

## Estructura

```
.
├─ index.html · servicios.html · precios.html · casos.html · contacto.html · 404.html
├─ partials/
│  ├─ header.html              # cabecera + menú, escrito una sola vez
│  └─ footer.html
├─ src/
│  ├─ main.js                  # punto de entrada común
│  ├─ style.css                # sistema de estilos (tokens, componentes, responsive)
│  └─ modules/
│     ├─ navegacion.js         # menú móvil
│     ├─ revelado.js           # aparición al hacer scroll
│     ├─ precios.js            # conmutador mensual/anual
│     ├─ formulario.js         # validación del contacto
│     └─ anio.js               # año del pie
├─ public/                     # se copia tal cual a dist/
│  └─ favicon.svg
├─ vite.config.js
├─ .nvmrc                      # versión de Node (la usa también el workflow)
└─ .github/
   ├─ workflows/deploy.yml
   └─ dependabot.yml           # actualizaciones mensuales de dependencias y Actions
```

## Cómo está montado

### Varias páginas (MPA), no una SPA

Cada `.html` de la raíz es una entrada independiente de Vite. `vite.config.js` las detecta sola
leyendo el directorio, así que **añadir una página es crear el archivo** — no hay que registrar
nada:

```js
const paginas = Object.fromEntries(
  readdirSync(raiz)
    .filter((archivo) => archivo.endsWith('.html'))
    .map((archivo) => [basename(archivo, '.html'), resolve(raiz, archivo)]),
)
```

La ventaja frente a una SPA con router: GitHub Pages sirve `/servicios.html` directamente. No
hace falta el truco de redirigir desde `404.html`, cada URL carga sola y los buscadores ven HTML
completo.

### Cabecera y pie compartidos

Un plugin pequeño en `vite.config.js` sustituye `<!-- include: header -->` por el contenido de
`partials/header.html`, y de paso marca con `aria-current="page"` el enlace de la página actual.
Corre con `order: 'pre'`, antes del procesado de assets, para que las rutas del partial también
reciban el prefijo de `base`.

### Enlaces internos: `{{base}}`

Vite reescribe las rutas de CSS, JS e imágenes, pero **no** los `href` de las etiquetas `<a>`.
Por eso los enlaces internos se escriben con el marcador `{{base}}`, que el mismo plugin sustituye
por la `base` resuelta:

```html
<a href="{{base}}servicios.html">Servicios</a>
<!-- desarrollo: /servicios.html · producción: /vite-github-pages/servicios.html -->
```

Con rutas relativas (`servicios.html`) el sitio funcionaría casi siempre, pero no en la 404:
GitHub Pages la sirve en la URL que se pidió (por ejemplo `/vite-github-pages/blog/post`), y desde
ahí un enlace relativo apunta a `/vite-github-pages/blog/servicios.html`.

### El detalle importante: `base`

GitHub Pages sirve el proyecto en `https://<usuario>.github.io/<repo>/`, no en la raíz del
dominio. Si `base` queda en `/`, el HTML pedirá `/assets/main-xxxx.js` y obtendrás una página en
blanco. Por eso `vite.config.js` usa `/<repo>/` al construir:

```js
const repo = 'vite-github-pages'   // <-- cámbialo si el repo se llama distinto
base: command === 'build' ? `/${repo}/` : '/'
```

Excepción: si el repo se llama `<usuario>.github.io`, el sitio se sirve en la raíz y `base` debe
ser `'/'` siempre.

## El formulario de contacto

GitHub Pages es hosting estático: no hay servidor que reciba el `POST`. El formulario valida en el
navegador y muestra una confirmación, pero **no envía nada**.

Para recibir los mensajes de verdad, apunta el formulario a un servicio externo y quita el
`preventDefault`:

```html
<form data-formulario action="https://formspree.io/f/TU_ID" method="POST">
```

```js
// src/modules/formulario.js
evento.preventDefault()   // <- borrar esta línea
```

## Publicar

1. Crea el repositorio en GitHub y sube el código:

   ```bash
   git init
   git add .
   git commit -m "Sitio estático multipágina con Vite"
   git branch -M main
   git remote add origin https://github.com/<usuario>/vite-github-pages.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. Cada `push` a `main` dispara el workflow. Cuando termine, el sitio queda en
   `https://<usuario>.github.io/vite-github-pages/` (el enlace también aparece en la pestaña
   **Actions**, en el job `deploy`).

En los pull requests el workflow solo construye el sitio, sin desplegarlo, para detectar fallos
antes de mergear (incluidos los PR que abre Dependabot).

## Personalizar

| Quiero cambiar... | Toca este archivo |
| --- | --- |
| Colores, tipografía, espaciados | Bloque `:root` de `src/style.css` |
| Nombre y logo | `partials/header.html` y `partials/footer.html` |
| Enlaces del menú | `partials/header.html` |
| Nombre del repositorio | Constante `repo` en `vite.config.js` |
| Añadir una página | Crear el `.html` en la raíz (se detecta sola) |

## Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| Página en blanco, errores 404 de `/assets/...` | `base` incorrecto | Ajusta `repo` en `vite.config.js` |
| Un enlace del menú da 404 al publicar | `href` sin el prefijo de `base` | Escríbelo como `{{base}}pagina.html` |
| Edito un partial y no se refresca | — | Ya cubierto por `handleHotUpdate`; reinicia si acabas de crear el archivo |
| El workflow falla en `npm ci` | Falta `package-lock.json` | Haz commit del lockfile |
| El workflow no arranca | Pages sigue en modo "Deploy from a branch" | Cambia Source a "GitHub Actions" |

## Licencia

[MIT](LICENSE)
