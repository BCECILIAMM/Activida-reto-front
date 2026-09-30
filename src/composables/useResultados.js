import { ref, computed, watch, toValue } from 'vue'
import { RESULTADOS } from '../data/resultados.js'

/**
 * Resultados del reto para quien tiene la sesión abierta.
 *
 * Solo hay resultados cuando el mes terminó y el reto tiene entrada en
 * `data/resultados.js`. El aviso se abre solo una vez por reto y dorsal; luego
 * se vuelve a abrir desde la tarjeta de "Mi reto".
 */

/** Lugar (1, 2 o 3) de un dorsal en el podio, o null si no está. */
export function lugarEnPodio(podio, dorsal) {
  if (!Array.isArray(podio) || !dorsal) return null
  const i = podio.indexOf(String(dorsal))
  return i >= 0 ? i + 1 : null
}

/** Resultados publicados de un reto, solo si ya terminó. */
export function resultadosDe(codigo, terminado, tabla = RESULTADOS) {
  if (!terminado || !codigo || !tabla[codigo]) return null
  return { codigo, ...tabla[codigo] }
}

const claveVisto = (codigo, dorsal) => `activida:resultados-vistos:${codigo}:${dorsal}`

function yaVisto(codigo, dorsal) {
  try {
    return localStorage.getItem(claveVisto(codigo, dorsal)) === '1'
  } catch {
    return false
  }
}

function marcarVisto(codigo, dorsal) {
  try {
    localStorage.setItem(claveVisto(codigo, dorsal), '1')
  } catch {
    // sin almacenamiento (modo privado): el aviso volverá a salir, no pasa nada
  }
}

export function useResultados({ challenge, dorsal, finished }) {
  const resultado = computed(() =>
    resultadosDe(toValue(challenge)?.codigo, toValue(finished))
  )

  const lugar = computed(() => lugarEnPodio(resultado.value?.podio, toValue(dorsal)))

  const visible = ref(false)

  // Se espera a tener el dorsal: si se abriera antes, a quien ganó le saldría
  // el aviso genérico y ya quedaría marcado como visto.
  watch(
    () => [resultado.value, toValue(dorsal)],
    ([r, d]) => {
      if (r && d && !yaVisto(r.codigo, d)) visible.value = true
    },
    { immediate: true }
  )

  function abrir() {
    visible.value = true
  }

  function cerrar() {
    visible.value = false
    const d = toValue(dorsal)
    if (resultado.value && d) marcarVisto(resultado.value.codigo, d)
  }

  return { resultado, lugar, visible, abrir, cerrar }
}
