// Validacion del formulario de contacto.
//
// GitHub Pages es hosting estatico: no hay backend que reciba el envio. Este
// modulo valida en el navegador y confirma en pantalla, a modo de demostracion.
// Para recibir los mensajes de verdad, pon un `action` a un servicio externo
// (Formspree, Basin, Getform...) y borra el `evento.preventDefault()` de abajo.

const MENSAJES = {
  nombre: 'Escribe tu nombre.',
  email: 'Escribe un correo valido.',
  mensaje: 'Cuentanos brevemente que quieres medir.',
  privacidad: 'Necesitamos tu consentimiento para responderte.',
}

const esEmailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)

export function iniciarFormulario() {
  const formulario = document.querySelector('[data-formulario]')
  if (!formulario) return

  const aviso = formulario.querySelector('[data-aviso]')

  const mostrarError = (campo, texto) => {
    const hueco = formulario.querySelector(`[data-error-de="${campo.name}"]`)
    if (hueco) hueco.textContent = texto
    campo.setAttribute('aria-invalid', String(Boolean(texto)))
  }

  const validar = (campo) => {
    if (!(campo.name in MENSAJES)) return true

    const valido =
      campo.type === 'checkbox'
        ? campo.checked
        : campo.name === 'email'
          ? esEmailValido(campo.value.trim())
          : campo.value.trim().length > 0

    mostrarError(campo, valido ? '' : MENSAJES[campo.name])
    return valido
  }

  // Revalidar en cuanto el usuario corrige, no antes: menos ruido mientras escribe.
  formulario.addEventListener('blur', (evento) => validar(evento.target), true)
  formulario.addEventListener('input', (evento) => {
    if (evento.target.getAttribute('aria-invalid') === 'true') validar(evento.target)
  })

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault() // <- quitar si se conecta a un servicio real

    const campos = [...formulario.elements].filter((campo) => campo.name in MENSAJES)
    const errores = campos.filter((campo) => !validar(campo))

    if (errores.length > 0) {
      aviso.textContent = ''
      errores[0].focus()
      return
    }

    const datos = Object.fromEntries(new FormData(formulario))
    console.info('Datos del formulario (demo, no se envian):', datos)

    aviso.textContent = `Gracias, ${datos.nombre.split(' ')[0]}. Es una demo, asi que el mensaje no se ha enviado a ningun sitio.`
    formulario.reset()
  })
}
