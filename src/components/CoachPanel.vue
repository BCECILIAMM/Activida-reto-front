<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { api } from '../services/api.js'
import { ApiError } from '../composables/useAuth.js'

const data = ref(null)
const loading = ref(false)
const error = ref('')
const loaded = ref(false)

const orden = ref('posicion')
const abiertos = ref(new Set())

const ORDENES = [
  { id: 'posicion', label: 'Posición' },
  { id: 'km', label: 'Kilómetros' },
  { id: 'minutos', label: 'Minutos' },
  { id: 'dias_activos', label: 'Constancia' },
  { id: 'nombre', label: 'Nombre' }
]

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await api.retos.panel()
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'No se pudo cargar el panel.'
  } finally {
    loading.value = false
    loaded.value = true
  }
}

onMounted(load)

/* Los badges automáticos no se registran, así que no se listan por corredora. */
const badgesNormales = computed(() => (data.value?.badges || []).filter((b) => b.tipo !== 'auto'))

/* Un mismo nombre en dos filas = la persona se registró dos veces. */
const repetidos = computed(() => {
  const cuenta = {}
  for (const f of data.value?.filas || []) cuenta[f.nombre] = (cuenta[f.nombre] || 0) + 1
  return new Set(Object.keys(cuenta).filter((n) => cuenta[n] > 1))
})

const filas = computed(() => {
  const lista = [...(data.value?.filas || [])]
  switch (orden.value) {
    case 'nombre':
      return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    case 'km':
      return lista.sort((a, b) => b.km - a.km || b.minutos - a.minutos)
    case 'minutos':
      return lista.sort((a, b) => b.minutos - a.minutos || b.km - a.km)
    case 'dias_activos':
      return lista.sort((a, b) => b.dias_activos - a.dias_activos || b.registros - a.registros)
    default:
      return lista.sort((a, b) => a.posicion - b.posicion)
  }
})

const sinRegistrar = computed(
  () => (data.value?.filas || []).filter((f) => f.registros === 0).length
)

function toggle(id) {
  const s = new Set(abiertos.value)
  s.has(id) ? s.delete(id) : s.add(id)
  abiertos.value = s
}

function km(n) {
  return Number(n || 0).toFixed(1)
}

function ent(n) {
  return Math.round(Number(n) || 0)
}

function valor(badge, cantidad) {
  const v = badge.unidad === 'km' ? km(cantidad) : ent(cantidad)
  return `${v}/${ent(badge.meta)}${badge.unidad ? ' ' + badge.unidad : ''}`
}

function pct(badge, cantidad) {
  return Math.min(100, (Number(cantidad || 0) / badge.meta) * 100)
}

function fecha(iso) {
  if (!iso) return 'nunca'
  const d = new Date(iso)
  const hoy = new Date()
  const ayer = new Date(hoy.getTime() - 86400000)
  const igual = (a, b) => a.toDateString() === b.toDateString()
  if (igual(d, hoy)) return 'hoy'
  if (igual(d, ayer)) return 'ayer'
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <section class="coach act-section">
    <h2 class="act-section-title">
      <i class="pi pi-chart-bar" /> Panel de seguimiento
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        size="small"
        text
        severity="secondary"
        class="coach__refresh"
        :disabled="loading"
        @click="load"
      />
    </h2>

    <div v-if="loading && !loaded" class="coach__loading act-panel">
      <ProgressSpinner strokeWidth="4" style="width: 42px; height: 42px" />
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-else-if="data">
      <!-- Resumen del grupo -->
      <div class="coach__tiles">
        <div class="coach__tile">
          <span class="coach__tile-n">{{ data.resumen.inscritas }}</span>
          <span class="coach__tile-k">Inscritas</span>
        </div>
        <div class="coach__tile coach__tile--ok">
          <span class="coach__tile-n">{{ data.resumen.con_actividad }}</span>
          <span class="coach__tile-k">Ya registraron</span>
        </div>
        <div class="coach__tile coach__tile--ok">
          <span class="coach__tile-n">{{ km(data.resumen.km_totales) }}<small>km</small></span>
          <span class="coach__tile-k">Del grupo</span>
        </div>
        <div class="coach__tile" :class="{ 'coach__tile--warn': data.resumen.registros_demo }">
          <span class="coach__tile-n">{{ data.resumen.registros_demo }}</span>
          <span class="coach__tile-k">Registros demo</span>
        </div>
      </div>

      <Message
        v-if="data.resumen.registros_demo"
        severity="warn"
        :closable="false"
        class="coach__aviso"
      >
        Los números de este panel <strong>no incluyen</strong> los
        {{ data.resumen.registros_demo }} registros que entraron por el botón "Probar" de la
        tarjeta de sincronización. Son datos de ejemplo, no carreras reales.
      </Message>

      <!-- Orden -->
      <div class="coach__sorts">
        <button
          v-for="o in ORDENES"
          :key="o.id"
          type="button"
          class="coach__sort"
          :aria-pressed="orden === o.id"
          @click="orden = o.id"
        >
          {{ o.label }}
        </button>
      </div>

      <p class="coach__hint">
        Toca a una corredora para ver su avance badge por badge.
        <template v-if="sinRegistrar">
          {{ sinRegistrar }} todavía no registran nada.
        </template>
      </p>

      <!-- Tabla -->
      <ol class="coach__list">
        <li v-for="f in filas" :key="f.inscripcion_id" class="coach__row act-panel">
          <button
            type="button"
            class="coach__btn"
            :aria-expanded="abiertos.has(f.inscripcion_id)"
            @click="toggle(f.inscripcion_id)"
          >
            <span class="coach__pos" :class="`coach__pos--${f.posicion <= 3 ? f.posicion : 'n'}`">
              {{ f.posicion }}
            </span>

            <span class="coach__who">
              <span class="coach__name" :class="{ 'is-idle': !f.registros }">{{ f.nombre }}</span>
              <span class="coach__meta">
                Dorsal {{ f.dorsal }} · {{ f.registros }} registros · última {{ fecha(f.ultima) }}
              </span>
              <span v-if="repetidos.has(f.nombre) || (!f.registros && f.registros_demo)" class="coach__chips">
                <span v-if="!f.registros && f.registros_demo" class="coach__chip">solo demo</span>
                <span v-if="repetidos.has(f.nombre)" class="coach__chip">cuenta repetida</span>
              </span>
            </span>

            <span class="coach__nums">
              <span class="coach__km">{{ km(f.km) }} km</span>
              <span class="coach__sub">{{ ent(f.minutos) }} min · {{ f.badges_completados }} ★</span>
            </span>

            <i class="pi pi-chevron-right coach__caret" />
          </button>

          <div v-if="abiertos.has(f.inscripcion_id)" class="coach__detail">
            <div class="coach__badges">
              <div
                v-for="b in badgesNormales"
                :key="b.codigo"
                class="coach__badge"
                :style="{ '--bc': b.color }"
              >
                <div class="coach__badge-top">
                  <span class="coach__badge-name">{{ b.emoji }} {{ b.nombre }}</span>
                  <span
                    class="coach__badge-v"
                    :class="{ 'is-done': f.manual[b.codigo] >= b.meta }"
                  >
                    {{ valor(b, f.manual[b.codigo]) }}
                  </span>
                </div>
                <div class="coach__track">
                  <div class="coach__fill" :style="{ width: pct(b, f.manual[b.codigo]) + '%' }" />
                </div>
              </div>
            </div>

            <div class="coach__foot">
              <span>Días con actividad <b>{{ f.dias_activos }}</b></span>
              <span>Desnivel <b>{{ ent(f.desnivel) }} m</b></span>
              <span>Nivel <b>{{ f.nivel ? f.nivel.nombre : '—' }}</b></span>
              <span v-if="f.registros_demo" class="coach__foot-warn">
                Registros demo <b>{{ f.registros_demo }}</b>
              </span>
            </div>
          </div>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.coach__refresh {
  margin-left: auto;
  font-size: 0.66rem !important;
  padding: 0.2rem 0.5rem !important;
  flex-shrink: 0;
}

.coach .act-section-title::after {
  display: none;
}

.coach__loading {
  display: grid;
  place-items: center;
  padding: 2rem;
}

/* ---------- resumen ---------- */
.coach__tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}

.coach__tile {
  background: var(--act-panel);
  border: 1px solid var(--act-border);
  border-radius: 12px;
  padding: 0.55rem 0.5rem;
  text-align: center;
}

.coach__tile-n {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--act-text);
  font-variant-numeric: tabular-nums;
}

.coach__tile-n small {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--act-text-3);
  margin-left: 0.1rem;
}

.coach__tile-k {
  display: block;
  font-size: 0.6rem;
  color: var(--act-text-3);
  margin-top: 0.1rem;
}

.coach__tile--ok .coach__tile-n {
  color: var(--act-green-strong);
}

.coach__tile--warn {
  border-color: color-mix(in srgb, var(--act-gold) 40%, var(--act-border));
}

.coach__tile--warn .coach__tile-n {
  color: var(--act-gold);
}

.coach__aviso {
  margin: 0 0 0.7rem !important;
  font-size: 0.78rem;
}

/* ---------- orden ---------- */
.coach__sorts {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.coach__sort {
  font: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--act-text-2);
  background: var(--act-panel);
  border: 1px solid var(--act-border);
  border-radius: 99px;
  padding: 0.22rem 0.6rem;
  cursor: pointer;
}

.coach__sort[aria-pressed='true'] {
  background: var(--act-green-strong);
  border-color: var(--act-green-strong);
  color: var(--act-on-accent);
}

.coach__hint {
  margin: 0 0 0.6rem;
  font-size: 0.7rem;
  color: var(--act-text-3);
}

/* ---------- lista ---------- */
.coach__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.coach__row {
  padding: 0;
  overflow: hidden;
}

.coach__btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  font: inherit;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
}

.coach__btn:hover {
  background: var(--act-accent-soft);
}

.coach__btn:focus-visible {
  outline: 2px solid var(--act-green-strong);
  outline-offset: -2px;
}

.coach__pos {
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--act-text-3);
  font-variant-numeric: tabular-nums;
}

.coach__pos--1 { color: var(--act-gold); }
.coach__pos--2 { color: var(--act-silver); }
.coach__pos--3 { color: var(--act-bronze); }

.coach__who {
  flex: 1;
  min-width: 0;
}

.coach__name {
  display: block;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--act-text);
  line-height: 1.2;
}

.coach__name.is-idle {
  color: var(--act-text-3);
  font-weight: 600;
}

.coach__meta {
  display: block;
  font-size: 0.64rem;
  color: var(--act-text-3);
  margin-top: 0.05rem;
}

.coach__chips {
  display: inline-flex;
  gap: 0.25rem;
  margin-top: 0.2rem;
}

.coach__chip {
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--act-gold);
  border: 1px solid color-mix(in srgb, var(--act-gold) 45%, transparent);
  background: color-mix(in srgb, var(--act-gold) 12%, transparent);
  border-radius: 4px;
  padding: 0.02rem 0.28rem;
}

.coach__nums {
  flex-shrink: 0;
  text-align: right;
}

.coach__km {
  display: block;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--act-green-strong);
  font-variant-numeric: tabular-nums;
}

.coach__sub {
  display: block;
  font-size: 0.62rem;
  color: var(--act-text-3);
  font-variant-numeric: tabular-nums;
}

.coach__caret {
  flex-shrink: 0;
  font-size: 0.6rem;
  color: var(--act-text-3);
  transition: transform 0.2s;
}

.coach__btn[aria-expanded='true'] .coach__caret {
  transform: rotate(90deg);
}

/* ---------- detalle ---------- */
.coach__detail {
  padding: 0.2rem 0.75rem 0.85rem;
  border-top: 1px dashed var(--act-border);
  background: var(--act-panel-2);
}

.coach__badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.4rem 0.9rem;
  padding-top: 0.7rem;
}

.coach__badge-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
}

.coach__badge-name {
  font-size: 0.7rem;
  color: var(--act-text-2);
}

.coach__badge-v {
  font-size: 0.64rem;
  color: var(--act-text-3);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.coach__badge-v.is-done {
  color: var(--act-green-strong);
  font-weight: 800;
}

.coach__track {
  height: 4px;
  border-radius: 99px;
  background: var(--act-track);
  overflow: hidden;
  margin-top: 0.15rem;
}

.coach__fill {
  height: 100%;
  border-radius: 99px;
  background: var(--bc, var(--act-green));
}

.coach__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
  margin-top: 0.7rem;
  padding-top: 0.55rem;
  border-top: 1px dashed var(--act-border);
  font-size: 0.66rem;
  color: var(--act-text-3);
}

.coach__foot b {
  color: var(--act-text-2);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.coach__foot-warn,
.coach__foot-warn b {
  color: var(--act-gold);
}

@media (max-width: 420px) {
  .coach__tiles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
