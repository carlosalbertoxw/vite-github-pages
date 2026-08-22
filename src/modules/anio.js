// Ano actual en el pie, para no tener que tocarlo cada enero.

export function iniciarAnio() {
  document.querySelectorAll('[data-anio]').forEach((elemento) => {
    elemento.textContent = String(new Date().getFullYear())
  })
}
