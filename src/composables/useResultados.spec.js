import { describe, it, expect } from 'vitest'
import { lugarEnPodio, resultadosDe } from './useResultados.js'

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
  it('no hay resultados mientras el reto sigue abierto', () => {
    expect(resultadosDe('2026-09', false, TABLA)).toBeNull()
  })

  it('no hay resultados si el reto no tiene entrada', () => {
    expect(resultadosDe('2026-10', true, TABLA)).toBeNull()
    expect(resultadosDe(undefined, true, TABLA)).toBeNull()
  })

  it('devuelve el podio y la imagen cuando el reto terminó', () => {
    expect(resultadosDe('2026-09', true, TABLA)).toEqual({
      codigo: '2026-09',
      imagen: 'resultados/reto-2026-09.jpg',
      podio: ['108', '118', '133']
    })
  })
})
