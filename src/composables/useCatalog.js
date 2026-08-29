import { ref, computed } from 'vue'
import { BADGES as BADGES_LOCAL, TIERS as TIERS_LOCAL, CHALLENGE as CHALLENGE_LOCAL } from '../data/badges.js'
import { api } from '../services/api.js'

/**
 * Catálogo del reto (definición del mes): reto activo, badges y niveles.
 *
 * Arranca con los datos locales de `data/badges.js` para que la primera
 * pintura, el modo sin conexión y el build de un solo archivo funcionen sin
 * backend. En cuanto `loadCatalog()` responde, se sustituyen por los del
 * servidor (`GET /api/retos/activo`), que es la fuente de verdad.
 */

const challenge = ref({ ...CHALLENGE_LOCAL })
const badges = ref(BADGES_LOCAL.map((b) => ({ ...b })))
const tiers = ref(TIERS_LOCAL.map((t) => ({ ...t })))

const source = ref('local') // 'local' | 'api'
const loaded = ref(false)
const loadError = ref('')

const localById = new Map(BADGES_LOCAL.map((b) => [b.id, b]))

/** Mezcla un badge de la API con la copia curada local (iconos, atajos, textos). */
function mapBadge(apiBadge) {
  const local = localById.get(apiBadge.codigo) || {}
  const unit = apiBadge.unidad || local.unit || null
  return {
    // base local: icon, step, fieldLabel, emoji de respaldo…
    ...local,
    id: apiBadge.codigo,
    emoji: apiBadge.emoji || local.emoji || '🏅',
    icon: local.icon || 'pi-flag',
    name: apiBadge.nombre ?? local.name ?? apiBadge.codigo,
    cat: apiBadge.categoria ?? local.cat ?? '',
    desc: apiBadge.descripcion ?? local.desc ?? '',
    how: apiBadge.como_conseguir ?? local.how ?? '',
    type: apiBadge.tipo ?? local.type ?? 'count',
    unit,
    goal: Number(apiBadge.meta ?? local.goal ?? 1),
    step: local.step ?? (unit === 'km' ? 0.1 : 1),
    source: apiBadge.fuente ?? local.source ?? 'manual',
    fieldLabel: local.fieldLabel ?? defaultFieldLabel(apiBadge, local),
    color: apiBadge.color || local.color || '#2ee56f',
    master: (apiBadge.tipo ?? local.type) === 'auto'
  }
}

function defaultFieldLabel(apiBadge, local) {
  if ((apiBadge.tipo ?? local.type) === 'numeric') return `¿Cuánto sumaste? (${apiBadge.unidad || ''})`.trim()
  return apiBadge.nombre ? `${apiBadge.nombre} completado` : 'Sesión completada'
}

function mapTier(nivel) {
  return {
    id: nivel.codigo,
    label: nivel.nombre,
    emoji: nivel.emoji,
    min: Number(nivel.min_badges),
    color: nivel.color || 'var(--act-green)'
  }
}

/** Normaliza una fecha DATE ("2026-09-01") a hora local de inicio de día. */
function toLocalDate(value) {
  if (!value) return value
  const s = String(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s
}

function applyReto(reto) {
  challenge.value = {
    codigo: reto.codigo,
    month: reto.mes,
    year: reto.anio,
    title: reto.nombre,
    subtitle: reto.subtitulo,
    startsAt: toLocalDate(reto.fecha_inicio),
    endsAt: toLocalDate(reto.fecha_fin)
  }
  if (Array.isArray(reto.badges) && reto.badges.length) {
    badges.value = [...reto.badges].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(mapBadge)
  }
  if (Array.isArray(reto.niveles) && reto.niveles.length) {
    tiers.value = [...reto.niveles].sort((a, b) => a.min_badges - b.min_badges).map(mapTier)
  }
  source.value = 'api'
}

/** Carga el reto activo desde el backend. Si falla, se queda con los datos locales. */
async function loadCatalog() {
  loadError.value = ''
  try {
    const reto = await api.retos.activo()
    if (reto) applyReto(reto)
  } catch (e) {
    loadError.value = e.message || 'No se pudo cargar el reto activo.'
  } finally {
    loaded.value = true
  }
}

export function useCatalog() {
  return {
    challenge,
    badges,
    tiers,
    catalogSource: computed(() => source.value),
    catalogLoaded: computed(() => loaded.value),
    catalogError: computed(() => loadError.value),
    loadCatalog
  }
}
