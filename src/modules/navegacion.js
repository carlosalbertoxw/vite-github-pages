// Menú de navegación en movil: abrir, cerrar y mantener aria-expanded al día.

export function iniciarNavegacion() {
  const boton = document.querySelector('.nav-toggle')
  const nav = document.querySelector('#nav-principal')

  if (!boton || !nav) return

  const cerrar = () => {
    nav.classList.remove('es-abierta')
    boton.setAttribute('aria-expanded', 'false')
    boton.querySelector('.visualmente-oculto').textContent = 'Abrir menú'
  }

  boton.addEventListener('click', () => {
    const abierta = nav.classList.toggle('es-abierta')
    boton.setAttribute('aria-expanded', String(abierta))
    boton.querySelector('.visualmente-oculto').textContent = abierta
      ? 'Cerrar menú'
      : 'Abrir menú'
  })

  // Cerrar al navegar a un ancla de la misma página.
  nav.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) cerrar()
  })

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar()
  })

  // Si se vuelve a escritorio, el menú desplegable deja de tener sentido.
  window.matchMedia('(min-width: 761px)').addEventListener('change', cerrar)
}
