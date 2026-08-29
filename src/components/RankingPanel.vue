<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { api } from '../services/api.js'
import { ApiError } from '../composables/useAuth.js'

const props = defineProps({
  myDorsal: { type: String, default: '' }
})

const rows = ref([])
const loading = ref(false)
const error = ref('')
const loaded = ref(false)

const medals = ['🥇', '🥈', '🥉']

function formatKm(km) {
  return Number(km || 0).toFixed(1)
}

function formatLast(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  const same = (a, b) => a.toDateString() === b.toDateString()
  if (same(d, today)) return 'Hoy'
  if (same(d, yesterday)) return 'Ayer'
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.retos.ranking(50)
    rows.value = data.posiciones || []
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'No se pudo cargar el ranking.'
  } finally {
    loading.value = false
    loaded.value = true
  }
}

onMounted(load)
</script>

<template>
  <section class="rank act-section">
    <h2 class="act-section-title">
      <i class="pi pi-trophy" /> Ranking del mes
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        size="small"
        text
        severity="secondary"
        class="rank__refresh"
        :disabled="loading"
        @click="load"
      />
    </h2>

    <div v-if="loading && !loaded" class="rank__loading act-panel">
      <ProgressSpinner strokeWidth="4" style="width: 42px; height: 42px" />
    </div>

    <Message v-else-if="error" severity="error" :closable="false" class="rank__msg">
      {{ error }}
    </Message>

    <div v-else-if="!rows.length" class="rank__empty act-panel">
      <span class="rank__empty-icon">🏁</span>
      <p class="rank__empty-title">Nadie ha registrado nada todavía</p>
      <p class="rank__empty-text">Sé la primera en aparecer aquí.</p>
    </div>

    <ol v-else class="rank__list">
      <li
        v-for="row in rows"
        :key="row.dorsal + row.nombre"
        class="rank__item act-panel"
        :class="{ 'is-me': myDorsal && row.dorsal === myDorsal, 'is-podium': row.posicion <= 3 }"
      >
        <span class="rank__pos">
          <span v-if="row.posicion <= 3" class="rank__medal">{{ medals[row.posicion - 1] }}</span>
          <span v-else>{{ row.posicion }}</span>
        </span>
        <div class="rank__who">
          <span class="rank__name">
            {{ row.nombre }}
            <span v-if="myDorsal && row.dorsal === myDorsal" class="rank__tagme">tú</span>
          </span>
          <span class="rank__meta">
            Dorsal {{ row.dorsal }} · última actividad {{ formatLast(row.ultima_actividad) }}
          </span>
        </div>
        <div class="rank__stats">
          <span class="rank__badges">{{ row.badges_completados }} <i class="pi pi-star-fill" /></span>
          <span class="rank__km">{{ formatKm(row.km) }} km</span>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.rank__refresh {
  margin-left: auto;
  font-size: 0.66rem !important;
  padding: 0.2rem 0.5rem !important;
  flex-shrink: 0;
}

.rank .act-section-title::after {
  display: none;
}

.rank__loading {
  display: grid;
  place-items: center;
  padding: 2rem;
}

.rank__msg {
  margin: 0 !important;
}

.rank__empty {
  padding: 1.6rem 1.2rem;
  text-align: center;
}

.rank__empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.4rem;
}

.rank__empty-title {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--act-text);
}

.rank__empty-text {
  margin: 0;
  font-size: 0.78rem;
  color: var(--act-text-2);
}

.rank__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.rank__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
}

.rank__item.is-podium {
  border-color: color-mix(in srgb, var(--act-gold, #eaa412) 35%, var(--act-border));
}

.rank__item.is-me {
  border-color: var(--act-green);
  background: color-mix(in srgb, var(--act-green) 8%, transparent);
}

.rank__pos {
  display: grid;
  place-items: center;
  width: 28px;
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--act-text-3);
  font-variant-numeric: tabular-nums;
}

.rank__medal {
  font-size: 1.15rem;
}

.rank__who {
  flex: 1;
  min-width: 0;
}

.rank__name {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--act-text);
}

.rank__tagme {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--act-on-accent);
  background: var(--act-green-strong);
  padding: 0.1rem 0.35rem;
  border-radius: 99px;
}

.rank__meta {
  display: block;
  font-size: 0.66rem;
  color: var(--act-text-3);
  margin-top: 0.1rem;
}

.rank__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
  flex-shrink: 0;
}

.rank__badges {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--act-text);
}

.rank__badges .pi {
  font-size: 0.62rem;
  color: var(--act-gold, #eaa412);
}

.rank__km {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--act-text-3);
  font-variant-numeric: tabular-nums;
}
</style>
