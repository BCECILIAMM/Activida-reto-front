import { ref, reactive, computed, watch } from 'vue'
import { BADGES, TIERS, CHALLENGE } from '../data/badges.js'

const STORAGE_KEY = 'activida:reto:2026-09'

/* ------------------------------------------------------------------
   Persistencia local.
   👉 Para conectar con Spring Boot: sustituye load()/persist() por
      llamadas a tu API REST (GET /api/reto/mi-progreso, POST /api/reto/actividad).
------------------------------------------------------------------ */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    /* noop */
  }
  return null
}

const saved = load() || {}

const runner = reactive({
  name: saved.name || '',
  bib: saved.bib || String(Math.floor(100 + Math.random() * 899))
})

const progress = reactive({})
BADGES.forEach((b) => {
  progress[b.id] = Number(saved.progress?.[b.id]) || 0
})

const history = ref(Array.isArray(saved.history) ? saved.history : [])

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: runner.name,
        bib: runner.bib,
        progress: { ...progress },
        history: history.value.slice(0, 200)
      })
    )
  } catch (e) {
    /* noop */
  }
}

watch([runner, progress, history], persist, { deep: true })

/* ------------------------------------------------------------------
   Reglas de negocio
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

/** Totales agregados para la fila de estadísticas */
const stats = computed(() => ({
  km: Number((progress.k25 || 0).toFixed(1)),
  minutes: Math.round(progress.min180 || 0),
  elevation: Math.round(progress.climber || 0),
  sessions: history.value.length
}))

/* ------------------------------------------------------------------
   Acciones
------------------------------------------------------------------ */
/**
 * Registra actividad sobre un badge.
 * @returns {{ unlocked: boolean, badge: object }}
 */
function logActivity(badge, amount, meta = {}) {
  const wasDone = isDone(badge)
  const value = Number(amount) || 0
  if (value <= 0) return { unlocked: false, badge, added: 0 }

  progress[badge.id] = Math.min(badge.goal, (progress[badge.id] || 0) + value)

  history.value.unshift({
    badgeId: badge.id,
    emoji: badge.emoji,
    name: badge.name,
    unit: badge.unit || null,
    added: value,
    notes: meta.notes || '',
    evidence: meta.evidence || 0,
    at: new Date().toISOString()
  })

  return { unlocked: !wasDone && isDone(badge), badge, added: value }
}

function undoLast() {
  const entry = history.value.shift()
  if (!entry) return null
  progress[entry.badgeId] = Math.max(0, (progress[entry.badgeId] || 0) - entry.added)
  return entry
}

function resetAll() {
  BADGES.forEach((b) => {
    progress[b.id] = 0
  })
  history.value = []
}

/** Simula una sincronización con Strava/Garmin (demo) */
function syncFromDevice() {
  const results = []
  const sample = [
    { id: 'k25', amount: 5.2 },
    { id: 'min180', amount: 34 },
    { id: 'climber', amount: 48 }
  ]
  sample.forEach(({ id, amount }) => {
    const badge = BADGES.find((b) => b.id === id)
    if (badge && progress[id] < badge.goal) {
      results.push(logActivity(badge, amount))
    }
  })
  return results
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
    // acciones
    logActivity,
    undoLast,
    resetAll,
    syncFromDevice
  }
}
