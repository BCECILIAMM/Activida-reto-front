/**
 * Definición de los badges del reto.
 * Cambiando este archivo cambias el reto del mes completo.
 *
 * type:
 *  - 'numeric'  → se acumula una cantidad (km, min, m de desnivel)
 *  - 'count'    → se cuenta 1 por sesión completada
 *  - 'weeks'    → se cuenta 1 por semana cumplida
 *  - 'evidence' → se cuenta 1 por sesión, pero exige foto/video
 *  - 'auto'     → se desbloquea solo al completar los demás
 *
 * source:
 *  - 'device'   → puede sincronizarse desde Strava/Garmin
 *  - 'manual'   → lo registra la usuaria
 *  - 'photo'    → requiere evidencia visual
 */
export const CHALLENGE = {
  month: 'Septiembre',
  year: 2026,
  startsAt: '2026-09-01T00:00:00-06:00',
  endsAt: '2026-10-01T00:00:00-06:00',
  title: 'Reto ActiVida',
  subtitle: 'Un mes. Diez badges. Tu mejor versión.'
}

export const BADGES = [
  {
    id: 'k25',
    emoji: '🏃',
    icon: 'pi-flag',
    name: 'K25',
    cat: 'Kilómetros',
    desc: 'Acumula 25 km corriendo durante el mes.',
    how: 'Se suman todos tus kilómetros de carrera. Puedes sincronizarlos desde Strava o Garmin.',
    type: 'numeric',
    unit: 'km',
    goal: 25,
    step: 0.1,
    source: 'device',
    fieldLabel: '¿Cuántos km corriste?',
    color: '#2ee56f'
  },
  {
    id: 'min180',
    emoji: '⏱️',
    icon: 'pi-clock',
    name: '180 Min',
    cat: 'Tiempo',
    desc: 'Acumula 180 minutos corriendo.',
    how: 'Cuenta el tiempo en movimiento de tus carreras, no el tiempo total con pausas.',
    type: 'numeric',
    unit: 'min',
    goal: 180,
    step: 1,
    source: 'device',
    fieldLabel: '¿Cuántos minutos corriste?',
    color: '#38bdf8'
  },
  {
    id: 'z2',
    emoji: '🐢',
    icon: 'pi-heart',
    name: 'Z2 Master',
    cat: 'Base aeróbica',
    desc: 'Completa 4 entrenamientos en Zona 2.',
    how: 'Zona 2 ≈ 60-70% de tu frecuencia cardiaca máxima. Debes poder hablar mientras corres.',
    type: 'count',
    goal: 4,
    source: 'device',
    fieldLabel: '¿Completaste un entrenamiento en Z2?',
    color: '#a3e635'
  },
  {
    id: 'strong',
    emoji: '💪',
    icon: 'pi-bolt',
    name: 'Strong Runner',
    cat: 'Fuerza',
    desc: 'Completa 6 sesiones de fuerza.',
    how: 'Sube una foto o video corto de cada sesión: gimnasio, peso corporal o liga elástica.',
    type: 'evidence',
    goal: 6,
    source: 'photo',
    fieldLabel: 'Sesión de fuerza completada',
    color: '#fb923c'
  },
  {
    id: 'climber',
    emoji: '🏔️',
    icon: 'pi-chart-line',
    name: 'Climber',
    cat: 'Desnivel',
    desc: 'Acumula 300 m de desnivel positivo (D+).',
    how: 'Es la suma de todo lo que subes. Los cerros y puentes cuentan.',
    type: 'numeric',
    unit: 'm',
    goal: 300,
    step: 1,
    source: 'device',
    fieldLabel: '¿Cuántos metros de desnivel acumulaste?',
    color: '#c084fc'
  },
  {
    id: 'longrun',
    emoji: '🔥',
    icon: 'pi-forward',
    name: 'Long Run',
    cat: 'Resistencia',
    desc: 'Completa 3 fondos programados.',
    how: 'Un fondo es tu carrera larga de la semana: 8 km o más en una sola salida.',
    type: 'count',
    goal: 3,
    source: 'device',
    fieldLabel: '¿Completaste un fondo? (8 km o más)',
    color: '#f43f5e'
  },
  {
    id: 'speed',
    emoji: '⚡',
    icon: 'pi-bolt',
    name: 'Speed',
    cat: 'Calidad',
    desc: 'Completa 3 sesiones de calidad.',
    how: 'Series, intervalos, fartlek o tempo. Cualquier entreno con cambios de ritmo planificados.',
    type: 'count',
    goal: 3,
    source: 'device',
    fieldLabel: '¿Completaste una sesión de calidad?',
    color: '#facc15'
  },
  {
    id: 'consistency',
    emoji: '🔄',
    icon: 'pi-sync',
    name: 'Consistency',
    cat: 'Constancia',
    desc: 'Corre al menos 2 días por semana, 4 semanas seguidas.',
    how: 'Marca la semana como cumplida cuando hayas corrido 2 o más días en ella.',
    type: 'weeks',
    goal: 4,
    source: 'manual',
    fieldLabel: '¿Esta semana ya corriste 2 días o más?',
    color: '#22d3ee'
  },
  {
    id: 'recovery',
    emoji: '🧘',
    icon: 'pi-sun',
    name: 'Recovery',
    cat: 'Recuperación',
    desc: 'Completa 6 sesiones de movilidad.',
    how: 'Estiramiento, yoga, foam roller o movilidad articular. Sube evidencia de cada sesión.',
    type: 'evidence',
    goal: 6,
    source: 'photo',
    fieldLabel: 'Sesión de movilidad completada',
    color: '#818cf8'
  },
  {
    id: 'master',
    emoji: '🏆',
    icon: 'pi-trophy',
    name: 'ActiVida Complete',
    cat: 'Reto maestro',
    desc: 'Consigue los 9 badges anteriores.',
    how: 'Se desbloquea automáticamente. Es el badge que corona el mes.',
    type: 'auto',
    goal: 9,
    source: 'auto',
    master: true,
    color: '#eaa412'
  }
]

/** Niveles por cantidad de badges conseguidos */
export const TIERS = [
  { id: 'bronce', label: 'Bronce', emoji: '🥉', min: 5, color: 'var(--act-bronze)' },
  { id: 'plata', label: 'Plata', emoji: '🥈', min: 7, color: 'var(--act-silver)' },
  { id: 'oro', label: 'Oro', emoji: '🥇', min: 9, color: 'var(--act-gold)' },
  { id: 'legend', label: 'Legend', emoji: '💎', min: 10, color: 'var(--act-legend)' }
]
