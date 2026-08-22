# vite-github-pages

Sitio web estatico de varias paginas construido con [Vite](https://vite.dev) y desplegado en
GitHub Pages mediante GitHub Actions.

El contenido es el de una empresa ficticia llamada **Cauce** (analitica operativa): nombres,
clientes, cifras y testimonios son de relleno, pensados para servir de plantilla.

## Requisitos

- Node.js 20 o superior
- Una cuenta de GitHub

## Uso local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

Otros comandos:

- `npm run build` — genera el sitio estatico en `dist/`
- `npm run preview` — sirve `dist/` localmente para revisar el resultado del build

## Paginas

| Archivo | Contenido |
| --- | --- |
| `index.html` | Portada: hero, ventajas, proceso, metricas, testimonio |
| `servicios.html` | Cuatro servicios en detalle, integraciones, alcance |
| `precios.html` | Tres planes con conmutador mensual/anual, comparativa y FAQ |
| `casos.html` | Tres casos de exito con contexto, solucion y resultados |
| `contacto.html` | Formulario validado, datos de contacto y FAQ |
| `404.html` | Pagina de error, servida sola por GitHub Pages |

## Estructura

```
.
├─ index.html · servicios.html · precios.html · casos.html · contacto.html · 404.html
├─ partials/
│  ├─ header.html              # cabecera + menu, escrito una sola vez
│  └─ footer.html
├─ src/
│  ├─ main.js                  # punto de entrada comun
│  ├─ style.css                # sistema de estilos (tokens, componentes, responsive)
│  └─ modules/
│     ├─ navegacion.js         # menu movil
│     ├─ revelado.js           # aparicion al hacer scroll
│     ├─ precios.js            # conmutador mensual/anual
│     ├─ formulario.js         # validacion del contacto
│     └─ anio.js               # ano del pie
├─ public/                     # se copia tal cual a dist/
│  ├─ favicon.svg
│  └─ .nojekyll                # evita que GitHub Pages procese el sitio con Jekyll
├─ vite.config.js
└─ .github/workflows/deploy.yml
```

## Como esta montado

### Varias paginas (MPA), no una SPA

Cada `.html` de la raiz es una entrada independiente de Vite. `vite.config.js` las detecta sola
leyendo el directorio, asi que **anadir una pagina es crear el archivo** — no hay que registrar
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

Un plugin de 30 lineas en `vite.config.js` sustituye `<!-- include: header -->` por el contenido
de `partials/header.html`, y de paso marca con `aria-current="page"` el enlace de la pagina
actual. Corre con `order: 'pre'`, antes del procesado de assets, para que las rutas del partial
tambien reciban el prefijo de `base`.

Los enlaces del menu son **relativos** (`servicios.html`, no `/servicios.html`) a proposito: Vite
no reescribe los `href` de las etiquetas `<a>`, asi que una ruta absoluta se romperia al
publicarse bajo `/<repo>/`.

### El detalle importante: `base`

GitHub Pages sirve el proyecto en `https://<usuario>.github.io/<repo>/`, no en la raiz del
dominio. Si `base` queda en `/`, el HTML pedira `/assets/main-xxxx.js` y obtendras una pagina en
blanco. Por eso `vite.config.js` usa `/<repo>/` al construir:

```js
const repo = 'vite-github-pages'   // <-- cambialo si el repo se llama distinto
base: command === 'build' ? `/${repo}/` : '/'
```

Excepcion: si el repo se llama `<usuario>.github.io`, el sitio se sirve en la raiz y `base` debe
ser `'/'` siempre.

## El formulario de contacto

GitHub Pages es hosting estatico: no hay servidor que reciba el `POST`. El formulario valida en el
navegador y muestra una confirmacion, pero **no envia nada**.

Para recibir los mensajes de verdad, apunta el formulario a un servicio externo y quita el
`preventDefault`:

```html
<form data-formulario action="https://formspree.io/f/TU_ID" method="POST">
```

```js
// src/modules/formulario.js
evento.preventDefault()   // <- borrar esta linea
```

## Publicar

1. Crea el repositorio en GitHub y sube el codigo:

   ```bash
   git init
   git add .
   git commit -m "Sitio estatico multipagina con Vite"
   git branch -M main
   git remote add origin https://github.com/<usuario>/vite-github-pages.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. Cada `push` a `main` dispara el workflow. Cuando termine, el sitio queda en
   `https://<usuario>.github.io/vite-github-pages/` (el enlace tambien aparece en la pestaña
   **Actions**, en el job `deploy`).

## Personalizar

| Quiero cambiar... | Toca este archivo |
| --- | --- |
| Colores, tipografia, espaciados | Bloque `:root` de `src/style.css` |
| Nombre y logo | `partials/header.html` y `partials/footer.html` |
| Enlaces del menu | `partials/header.html` |
| Nombre del repositorio | Constante `repo` en `vite.config.js` |
| Anadir una pagina | Crear el `.html` en la raiz (se detecta sola) |

## Problemas frecuentes

| Sintoma | Causa | Solucion |
| --- | --- | --- |
| Pagina en blanco, errores 404 de `/assets/...` | `base` incorrecto | Ajusta `repo` en `vite.config.js` |
| Los enlaces del menu dan 404 al publicar | Rutas absolutas en los `<a>` | Usa rutas relativas (`servicios.html`) |
| Edito un partial y no se refresca | — | Ya cubierto por `handleHotUpdate`; reinicia si acabas de crear el archivo |
| El workflow falla en `npm ci` | Falta `package-lock.json` | Haz commit del lockfile |
| El workflow no arranca | Pages sigue en modo "Deploy from a branch" | Cambia Source a "GitHub Actions" |
