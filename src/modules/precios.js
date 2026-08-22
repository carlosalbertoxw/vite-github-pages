// Conmutador mensual / anual de la pagina de precios.
// Los importes viven en el HTML (data-mensual / data-anual) para que la pagina
// siga siendo legible y correcta aunque el JS no llegue a ejecutarse.

const formateador = new Intl.NumberFormat('es-ES')

export function iniciarPrecios() {
  const opciones = document.querySelectorAll('.conmutador__opcion[data-periodo]')
  if (opciones.length === 0) return

  const precios = document.querySelectorAll('[data-precio]')
  const notas = document.querySelectorAll('[data-nota-periodo]')

  const aplicar = (periodo) => {
    opciones.forEach((opcion) => {
      const activa = opcion.dataset.periodo === periodo
      opcion.classList.toggle('es-activa', activa)
      opcion.setAttribute('aria-pressed', String(activa))
    })

    precios.forEach((precio) => {
      const valor = Number(precio.dataset[periodo])
      if (Number.isFinite(valor)) precio.textContent = formateador.format(valor)
    })

    notas.forEach((nota) => {
      nota.textContent =
        periodo === 'anual'
          ? 'Facturado anualmente · 20 % de descuento'
          : 'Facturado mensualmente'
    })
  }

  opciones.forEach((opcion) => {
    opcion.addEventListener('click', () => aplicar(opcion.dataset.periodo))
  })

  aplicar('mensual')
}
