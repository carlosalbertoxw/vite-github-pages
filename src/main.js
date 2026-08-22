// Punto de entrada compartido por todas las paginas.
// Cada modulo se auto-desactiva si su HTML no esta presente, asi que el mismo
// bundle sirve para el inicio, precios o contacto sin comprobaciones extra aqui.
import { iniciarNavegacion } from './modules/navegacion.js'
import { iniciarRevelado } from './modules/revelado.js'
import { iniciarPrecios } from './modules/precios.js'
import { iniciarFormulario } from './modules/formulario.js'
import { iniciarAnio } from './modules/anio.js'

iniciarNavegacion()
iniciarRevelado()
iniciarPrecios()
iniciarFormulario()
iniciarAnio()
