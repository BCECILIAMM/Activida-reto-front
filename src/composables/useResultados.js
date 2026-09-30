import { ref, computed, watch, toValue } from 'vue'
import { RESULTADOS } from '../data/resultados.js'

/**
 * Resultados del reto para quien tiene la sesión abierta.
 *
 * Hay resultados en cuanto el reto tiene entrada en `data/resultados.js`:
 * esa entrada es la que los publica. Todas las personas ven el podio y el
 * agradecimiento; a quien quedó en los tres primeros lugares, además, se le
 * dice su lugar.
 *
 * El aviso se abre solo una vez por reto y cuenta; luego se vuelve a abrir
 * desde la tarjeta de "Mi reto".
 */

/** Lugar (1, 2 o 3) de un dorsal en el podio, o null si no está. */
export function lugarEnPodio(podio, dorsal) {
  if (!Array.isArray(podio) || !dorsal) return null
  const i = podio.indexOf(String(dorsal))
  return i >= 0 ? i + 1 : null
}

/** Resultados publicados de un reto, o null si todavía no hay. */
export function resultadosDe(codigo, tabla = RESULTADOS) {
  if (!codigo || !tabla[codigo]) return null
  return { codigo, ...tabla[codigo] }
}

const claveVisto = (codigo, usuarioId) => `activida:resultados-vistos:${codigo}:${usuarioId}`

function yaVisto(codigo, usuarioId) {
  try {
    return localStorage.getItem(claveVisto(codigo, usuarioId)) === '1'
  } catch {
    return false
  }
}

function marcarVisto(codigo, usuarioId) {
  try {
    localStorage.setItem(claveVisto(codigo, usuarioId), '1')
  } catch {
    // sin almacenamiento (modo privado): el aviso volverá a salir, no pasa nada
  }
}

/**
 * @param challenge  reto activo (ref o getter), de él sale el código
 * @param dorsal     dorsal de la sesión, para saber si quedó en el podio
 * @param usuarioId  id de la cuenta, para recordar que ya vio el aviso
 * @param listo      true cuando ya cargó el progreso: antes de eso el dorsal
 *                   puede no haber llegado, y a quien ganó le saldría el aviso
 *                   genérico y quedaría marcado como visto.
 */
export function useResultados({ challenge, dorsal, usuarioId, listo }) {
  const resultado = computed(() => resultadosDe(toValue(challenge)?.codigo))

  const lugar = computed(() => lugarEnPodio(resultado.value?.podio, toValue(dorsal)))

  const visible = ref(false)

  watch(
    () => [resultado.value, toValue(usuarioId), toValue(listo)],
    ([r, u, ok]) => {
      if (r && u && ok && !yaVisto(r.codigo, u)) visible.value = true
    },
    { immediate: true }
  )

  function abrir() {
    visible.value = true
  }

  function cerrar() {
    visible.value = false
    const u = toValue(usuarioId)
    if (resultado.value && u) marcarVisto(resultado.value.codigo, u)
  }

  return { resultado, lugar, visible, abrir, cerrar }
}
