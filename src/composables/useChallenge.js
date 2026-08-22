import { ref, reactive, computed } from 'vue'
import { BADGES, TIERS, CHALLENGE } from '../data/badges.js'
import { api } from '../services/api.js'

const runner = reactive({ name: '', bib: '' })

const progress = reactive({})
BADGES.forEach((b) => {
  progress[b.id] = 0
})

const history = ref([])
const loading = ref(false)
const error = ref('')

/* ------------------------------------------------------------------
   Mapeo desde la API (GET /api/retos/mi-progreso)
------------------------------------------------------------------ */
function applyProgreso(data) {
  runner.bib = data.inscripcion?.dorsal || runner.bib

  data.badges
    .filter((b) => b.tipo !== 'auto')
    .forEach((b) => {
      progress[b.codigo] = Number(b.acumulado) || 0
    })

  history.value = (data.historial || []).map(mapHistorialItem)
}

function mapHistorialItem(item) {
  return {
    id: item.id,
    badgeId: item.badge_codigo,
    emoji: item.emoji,
    name: item.badge_nombre,
    unit: item.unidad || null,
    added: Number(item.cantidad) || 0,
    notes: item.notas || '',
    evidence: item.evidencias || 0,
    at: item.registrado_en
  }
}

/** Carga (o recarga) el progreso desde el backend. */
async function refresh() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.retos.miProgreso()
    applyProgreso(data)
  } catch (e) {
    error.value = e.message || 'No se pudo cargar tu progreso.'
    throw e
  } finally {
    loading.value = false
  }
}

/** Se llama una vez que sabemos quién inició sesión. */
function setRunnerName(name) {
  if (name && !runner.name) runner.name = name
}

/** Limpia el estado local al cerrar sesión, para que no se mezcle con la siguiente cuenta. */
function clear() {
  runner.name = ''
  runner.bib = ''
  BADGES.forEach((b) => {
    progress[b.id] = 0
  })
  history.value = []
}

/* ------------------------------------------------------------------
   Reglas de negocio (derivadas, igual que antes)
------------------------------------------------------------------ */
function isDone(badge) {
  if (badge.master) return completedCount.value >= badge.goal
  return (progress[badge.id] || 0) >= badge.goal
}

function ratio(badge) {
  const current = badge.master ? completedCount.value : progress[badge.id] || 0
  return Math.max(0, Math.min(1, current / badge.goal))
}

function currentValue(badge) {
  return badge.master ? completedCount.value : progress[badge.id] || 0
}

function formatValue(badge) {
  const v = currentValue(badge)
  if (badge.master) return `${v}/${badge.goal}`
  const shown = badge.unit === 'km' ? Number(v.toFixed(1)) : Math.round(v)
  return badge.unit ? `${shown}/${badge.goal} ${badge.unit}` : `${shown}/${badge.goal}`
}

const completedCount = computed(() => BADGES.filter((b) => !b.master && isDone(b)).length)

const totalBadges = computed(() => BADGES.length)

const allCompleted = computed(() => BADGES.filter((b) => isDone(b)).length)

const currentTier = computed(() => {
  let found = null
  for (const t of TIERS) {
    if (allCompleted.value >= t.min) found = t
  }
  return found
})

const nextTier = computed(() => TIERS.find((t) => allCompleted.value < t.min) || null)

const overallRatio = computed(() => allCompleted.value / totalBadges.value)

const stats = computed(() => ({
  km: Number((progress.k25 || 0).toFixed(1)),
  minutes: Math.round(progress.min180 || 0),
  elevation: Math.round(progress.climber || 0),
  sessions: history.value.length
}))

/* ------------------------------------------------------------------
   Acciones — todas hablan con la API, no con localStorage
------------------------------------------------------------------ */

/**
 * Registra actividad sobre un badge.
 * @returns {Promise<{ unlocked: boolean, badge: object, added: number, subioDeNivel: object|null }>}
 */
async function logActivity(badge, amount, meta = {}) {
  const value = Number(amount) || 0
  if (value <= 0) return { unlocked: false, badge, added: 0, subioDeNivel: null }

  // Nota: la evidencia (foto/video) todavía no se sube a R2 desde aquí —
  // solo se registra la actividad. Falta conectar el flujo de 3 pasos
  // (url-de-subida → PUT a R2 → confirmar) descrito en el README del backend.
  const resultado = await api.actividades.registrar({
    badge: badge.id,
    cantidad: value,
    notas: meta.notes || undefined
  })

  applyProgresoParcial(resultado.progreso)

  history.value.unshift({
    id: resultado.actividad.id,
    badgeId: badge.id,
    emoji: badge.emoji,
    name: badge.name,
    unit: badge.unit || null,
    added: value,
    notes: meta.notes || '',
    evidence: meta.evidence || 0,
    at: resultado.actividad.registrado_en
  })

  const unlocked = resultado.desbloqueados.some((d) => d.codigo === badge.id)
  return { unlocked, badge, added: value, subioDeNivel: resultado.subio_de_nivel || null }
}

function applyProgresoParcial(progreso) {
  if (!progreso) return
  progreso.badges
    .filter((b) => b.tipo !== 'auto')
    .forEach((b) => {
      progress[b.codigo] = Number(b.acumulado) || 0
    })
}

async function undoLast() {
  const entry = history.value[0]
  if (!entry) return null

  await api.actividades.borrar(entry.id)
  await refresh()
  return entry
}

async function resetAll() {
  await api.actividades.reiniciar()
  await refresh()
}

/**
 * Simula una sincronización con Strava/Garmin (demo): manda datos de
 * ejemplo al endpoint real POST /actividades/sincronizar. Como cada
 * actividad trae un externo_id fijo, sincronizar dos veces no duplica:
 * la segunda vez el backend las reporta como "omitidas".
 */
async function syncFromDevice() {
  const sample = [
    { externo_id: 'demo-strava-k25-1', badge: 'k25', cantidad: 5.2 },
    { externo_id: 'demo-strava-min180-1', badge: 'min180', cantidad: 34 },
    { externo_id: 'demo-strava-climber-1', badge: 'climber', cantidad: 48 }
  ]

  const resultado = await api.actividades.sincronizar({ origen: 'strava', actividades: sample })
  applyProgresoParcial(resultado.progreso)
  if (resultado.importadas > 0) await refresh()

  return resultado.detalle.importadas.map((item) => ({
    unlocked: resultado.desbloqueados.some((d) => d.codigo === item.badge),
    badge: BADGES.find((b) => b.id === item.badge),
    added: item.cantidad
  }))
}

export function useChallenge() {
  return {
    // datos
    challenge: CHALLENGE,
    badges: BADGES,
    tiers: TIERS,
    runner,
    progress,
    history,
    loading,
    error,
    // derivados
    completedCount,
    allCompleted,
    totalBadges,
    currentTier,
    nextTier,
    overallRatio,
    stats,
    // helpers
    isDone,
    ratio,
    currentValue,
    formatValue,
    // sesión / carga
    refresh,
    setRunnerName,
    clear,
    // acciones
    logActivity,
    undoLast,
    resetAll,
    syncFromDevice
  }
}
