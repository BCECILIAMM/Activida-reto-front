import { ref, reactive, computed } from 'vue'
import {
  api,
  ApiError,
  uploadToSignedUrl,
  EVIDENCIA_TIPOS,
  EVIDENCIA_MAX_BYTES
} from '../services/api.js'
import { useCatalog } from './useCatalog.js'

const { challenge, badges, tiers } = useCatalog()

const PAGE = 50

const runner = reactive({ name: '', bib: '' })
const progress = reactive({})
const resumen = ref(null)

const history = ref([])
const loading = ref(false)
const error = ref('')
const lastPageFull = ref(false)

/* ------------------------------------------------------------------
   Validación de evidencias (debe coincidir con el backend)
------------------------------------------------------------------ */
export function validarEvidencia(file) {
  if (!EVIDENCIA_TIPOS.includes(file.type)) {
    return `"${file.name}": formato no admitido. Usa JPG, PNG, WebP, HEIC, MP4 o MOV.`
  }
  if (file.size > EVIDENCIA_MAX_BYTES) {
    const mb = Math.round(EVIDENCIA_MAX_BYTES / 1024 / 1024)
    return `"${file.name}" pesa más de ${mb} MB.`
  }
  return null
}

/**
 * Sube las evidencias de una actividad en tres pasos:
 *   1. pide una URL firmada al backend
 *   2. sube el archivo DIRECTO a R2
 *   3. confirma que terminó
 * Si el almacenamiento no está configurado (503) o algún archivo falla, la
 * actividad ya quedó registrada: se devuelven los errores para avisar, sin
 * romper el flujo.
 */
async function subirEvidencias(actividadId, files = []) {
  let subidas = 0
  const errores = []
  for (const file of files) {
    try {
      const pre = await api.evidencias.urlDeSubida({
        actividad_id: actividadId,
        content_type: file.type,
        bytes: file.size
      })
      await uploadToSignedUrl(pre.url_de_subida, file, file.type)
      await api.evidencias.confirmar(pre.evidencia_id)
      subidas++
    } catch (e) {
      if (e instanceof ApiError && e.status === 503) {
        errores.push('La subida de fotos no está disponible todavía en el servidor.')
        break // no tiene sentido reintentar con los demás archivos
      }
      errores.push(e instanceof ApiError ? e.message : `No se pudo subir "${file.name}".`)
    }
  }
  return { subidas, errores }
}

/* ------------------------------------------------------------------
   Mapeo desde la API
------------------------------------------------------------------ */
function applyProgreso(data) {
  runner.bib = data.inscripcion?.dorsal || runner.bib
  resumen.value = data.resumen || null

  ;(data.badges || [])
    .filter((b) => b.tipo !== 'auto')
    .forEach((b) => {
      progress[b.codigo] = Number(b.acumulado) || 0
    })

  history.value = (data.historial || []).map(mapHistorialItem)
  lastPageFull.value = (data.historial || []).length >= PAGE
}

function applyProgresoParcial(progreso) {
  if (!progreso) return
  resumen.value = progreso.resumen || resumen.value
  ;(progreso.badges || [])
    .filter((b) => b.tipo !== 'auto')
    .forEach((b) => {
      progress[b.codigo] = Number(b.acumulado) || 0
    })
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

/** Trae la siguiente página del historial. */
async function loadMoreHistory() {
  if (!lastPageFull.value) return
  const { items } = await api.actividades.historial({ limite: PAGE, desde: history.value.length })
  history.value.push(...items.map(mapHistorialItem))
  lastPageFull.value = items.length >= PAGE
}

const hasMoreHistory = computed(() => lastPageFull.value)

/** Se llama una vez que sabemos quién inició sesión. */
function setRunnerName(name) {
  if (name && !runner.name) runner.name = name
}

/** Limpia el estado local al cerrar sesión. */
function clear() {
  runner.name = ''
  runner.bib = ''
  Object.keys(progress).forEach((k) => delete progress[k])
  resumen.value = null
  history.value = []
  lastPageFull.value = false
}

/* ------------------------------------------------------------------
   Reglas de negocio (derivadas)
------------------------------------------------------------------ */
const completedCount = computed(
  () => badges.value.filter((b) => !b.master && isDone(b)).length
)

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

const totalBadges = computed(() => badges.value.length)
const allCompleted = computed(() => badges.value.filter((b) => isDone(b)).length)

const currentTier = computed(() => {
  let found = null
  for (const t of tiers.value) {
    if (allCompleted.value >= t.min) found = t
  }
  return found
})

const nextTier = computed(() => tiers.value.find((t) => allCompleted.value < t.min) || null)
const overallRatio = computed(() => (totalBadges.value ? allCompleted.value / totalBadges.value : 0))

const stats = computed(() => {
  if (resumen.value) {
    return {
      km: Number((resumen.value.km || 0).toFixed(1)),
      minutes: Math.round(resumen.value.minutos || 0),
      elevation: Math.round(resumen.value.desnivel || 0),
      sessions: history.value.length
    }
  }
  return {
    km: Number((progress.k25 || 0).toFixed(1)),
    minutes: Math.round(progress.min180 || 0),
    elevation: Math.round(progress.climber || 0),
    sessions: history.value.length
  }
})

/* ------------------------------------------------------------------
   Acciones — todas hablan con la API
------------------------------------------------------------------ */

/**
 * Registra actividad sobre un badge y, si trae archivos, sube las evidencias.
 * @returns {Promise<{ unlocked, badge, added, subioDeNivel, evidencia: { subidas, errores } }>}
 */
async function logActivity(badge, amount, meta = {}) {
  const value = Number(amount) || 0
  const files = meta.files || []
  if (value <= 0) {
    return { unlocked: false, badge, added: 0, subioDeNivel: null, evidencia: { subidas: 0, errores: [] } }
  }

  const resultado = await api.actividades.registrar({
    badge: badge.id,
    cantidad: value,
    notas: meta.notes || undefined
  })

  applyProgresoParcial(resultado.progreso)

  const evidencia = files.length
    ? await subirEvidencias(resultado.actividad.id, files)
    : { subidas: 0, errores: [] }

  history.value.unshift({
    id: resultado.actividad.id,
    badgeId: badge.id,
    emoji: badge.emoji,
    name: badge.name,
    unit: badge.unit || null,
    added: value,
    notes: meta.notes || '',
    evidence: evidencia.subidas,
    at: resultado.actividad.registrado_en
  })

  const unlocked = resultado.desbloqueados.some((d) => d.codigo === badge.id)
  return {
    unlocked,
    badge,
    added: value,
    subioDeNivel: resultado.subio_de_nivel || null,
    evidencia
  }
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
 * Sincronización de demostración: manda datos de ejemplo al endpoint real
 * `POST /actividades/sincronizar`. Cada actividad trae un `externo_id` fijo,
 * así que repetir la sincronización no duplica: el backend las reporta como
 * "omitidas". La integración real con Strava/Garmin (OAuth) aún no existe.
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
    badge: badges.value.find((b) => b.id === item.badge),
    added: item.cantidad
  }))
}

export function useChallenge() {
  return {
    // datos
    challenge,
    badges,
    tiers,
    runner,
    progress,
    resumen,
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
    hasMoreHistory,
    // helpers
    isDone,
    ratio,
    currentValue,
    formatValue,
    // sesión / carga
    refresh,
    loadMoreHistory,
    setRunnerName,
    clear,
    // acciones
    logActivity,
    undoLast,
    resetAll,
    syncFromDevice
  }
}
