import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { lugarEnPodio, resultadosDe, useResultados } from './useResultados.js'

const TABLA = {
  '2026-09': { imagen: 'resultados/reto-2026-09.jpg', podio: ['108', '118', '133'] }
}

describe('lugarEnPodio', () => {
  it('da el lugar según el orden del podio', () => {
    expect(lugarEnPodio(['108', '118', '133'], '108')).toBe(1)
    expect(lugarEnPodio(['108', '118', '133'], '133')).toBe(3)
  })

  it('acepta el dorsal como número', () => {
    expect(lugarEnPodio(['108', '118', '133'], 118)).toBe(2)
  })

  it('devuelve null fuera del podio o sin dorsal', () => {
    expect(lugarEnPodio(['108', '118', '133'], '120')).toBeNull()
    expect(lugarEnPodio(['108', '118', '133'], '')).toBeNull()
    expect(lugarEnPodio(undefined, '108')).toBeNull()
  })
})

describe('resultadosDe', () => {
  it('no hay resultados si el reto no tiene entrada', () => {
    expect(resultadosDe('2026-10', TABLA)).toBeNull()
    expect(resultadosDe(undefined, TABLA)).toBeNull()
  })

  it('devuelve el podio y la imagen del reto publicado', () => {
    expect(resultadosDe('2026-09', TABLA)).toEqual({
      codigo: '2026-09',
      imagen: 'resultados/reto-2026-09.jpg',
      podio: ['108', '118', '133']
    })
  })
})

describe('useResultados', () => {
  const reto = ref({ codigo: '2026-09' })

  it('abre el aviso para cualquier cuenta cuando ya cargó el progreso', async () => {
    const listo = ref(false)
    const { visible, lugar } = useResultados({
      challenge: reto,
      dorsal: () => '120',
      usuarioId: () => 7,
      listo
    })
    expect(visible.value).toBe(false)
    listo.value = true
    await nextTick()
    expect(visible.value).toBe(true)
    expect(lugar.value).toBeNull()
  })

  it('a quien quedó en el podio le da su lugar', () => {
    const { lugar } = useResultados({
      challenge: reto,
      dorsal: () => '118',
      usuarioId: () => 8,
      listo: () => true
    })
    expect(lugar.value).toBe(2)
  })

  it('no abre nada si el reto no tiene resultados publicados', () => {
    const { visible, resultado } = useResultados({
      challenge: () => ({ codigo: '2099-01' }),
      dorsal: () => '108',
      usuarioId: () => 9,
      listo: () => true
    })
    expect(resultado.value).toBeNull()
    expect(visible.value).toBe(false)
  })
})
