import { describe, it, expect, beforeEach } from 'vitest'
import { useChallenge, validarEvidencia } from './useChallenge.js'
import { EVIDENCIA_MAX_BYTES } from '../services/api.js'

const c = useChallenge()

function badge(id) {
  return c.badges.value.find((b) => b.id === id)
}

function setProgress(map) {
  Object.keys(c.progress).forEach((k) => delete c.progress[k])
  Object.assign(c.progress, map)
}

beforeEach(() => {
  c.clear()
})

describe('validarEvidencia', () => {
  it('acepta una imagen JPG dentro del límite', () => {
    expect(validarEvidencia({ name: 'a.jpg', type: 'image/jpeg', size: 1024 })).toBeNull()
  })

  it('rechaza un formato no permitido', () => {
    const msg = validarEvidencia({ name: 'virus.exe', type: 'application/x-msdownload', size: 10 })
    expect(msg).toMatch(/formato no admitido/i)
  })

  it('rechaza un archivo más grande que el máximo', () => {
    const msg = validarEvidencia({ name: 'video.mp4', type: 'video/mp4', size: EVIDENCIA_MAX_BYTES + 1 })
    expect(msg).toMatch(/pesa más de/i)
  })
})

describe('reglas derivadas del reto', () => {
  it('isDone y ratio respetan la meta del badge', () => {
    setProgress({ k25: 12.5 })
    expect(c.isDone(badge('k25'))).toBe(false)
    expect(c.ratio(badge('k25'))).toBeCloseTo(0.5)

    setProgress({ k25: 30 })
    expect(c.isDone(badge('k25'))).toBe(true)
    expect(c.ratio(badge('k25'))).toBe(1) // no pasa de 1 aunque se pase de la meta
  })

  it('formatValue muestra unidad y decimales correctos', () => {
    setProgress({ k25: 7.25, min180: 90 })
    expect(c.formatValue(badge('k25'))).toBe('7.3/25 km')
    expect(c.formatValue(badge('min180'))).toBe('90/180 min')
  })

  it('con 5 badges se alcanza el nivel bronce', () => {
    setProgress({ k25: 25, min180: 180, z2: 4, longrun: 3, speed: 3 })
    expect(c.allCompleted.value).toBe(5)
    expect(c.currentTier.value?.id).toBe('bronce')
    expect(c.nextTier.value?.id).toBe('plata')
  })

  it('el badge maestro se completa solo al llegar a los 9', () => {
    setProgress({
      k25: 25,
      min180: 180,
      z2: 4,
      strong: 6,
      climber: 300,
      longrun: 3,
      speed: 3,
      consistency: 4,
      recovery: 6
    })
    expect(c.completedCount.value).toBe(9)
    expect(c.isDone(badge('master'))).toBe(true)
    expect(c.allCompleted.value).toBe(10)
  })

  it('clear deja el progreso en cero', () => {
    setProgress({ k25: 25 })
    c.clear()
    expect(c.allCompleted.value).toBe(0)
    expect(c.stats.value.km).toBe(0)
  })
})
