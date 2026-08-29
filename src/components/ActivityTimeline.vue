<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  history: { type: Array, default: () => [] },
  limit: { type: Number, default: 15 },
  hasMore: { type: Boolean, default: false }
})

const emit = defineEmits(['undo', 'more'])

const shown = ref(0)
const items = computed(() =>
  props.history.slice(0, props.limit + shown.value)
)

function showMore() {
  // Muestra más de lo ya cargado; si se acaba lo local, pide otra página.
  if (props.limit + shown.value < props.history.length) {
    shown.value += props.limit
  } else if (props.hasMore) {
    emit('more')
    shown.value += props.limit
  }
}

function formatDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  const same = (a, b) => a.toDateString() === b.toDateString()
  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  if (same(d, today)) return `Hoy · ${time}`
  if (same(d, yesterday)) return `Ayer · ${time}`
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ` · ${time}`
}

function formatAmount(entry) {
  const n = entry.unit === 'km' ? Number(entry.added.toFixed(1)) : Math.round(entry.added)
  return entry.unit ? `+${n} ${entry.unit}` : `+${n}`
}
</script>

<template>
  <section class="tl act-section">
    <h2 class="act-section-title">
      <i class="pi pi-history" /> Tu actividad
      <Button
        v-if="history.length"
        label="Deshacer"
        icon="pi pi-undo"
        size="small"
        text
        severity="secondary"
        class="tl__undo"
        @click="emit('undo')"
      />
    </h2>

    <div v-if="!items.length" class="tl__empty act-panel">
      <span class="tl__empty-icon">👟</span>
      <p class="tl__empty-title">Todavía no registras nada</p>
      <p class="tl__empty-text">
        Toca <strong>Registrar</strong> en cualquier badge para empezar. El primer kilómetro
        siempre es el que más cuesta.
      </p>
    </div>

    <ol v-else class="tl__list">
      <li v-for="(entry, i) in items" :key="entry.at + i" class="tl__item act-panel">
        <span class="tl__dot"><span class="tl__emoji">{{ entry.emoji }}</span></span>
        <div class="tl__body">
          <div class="tl__row">
            <span class="tl__name">{{ entry.name }}</span>
            <span class="tl__amount">{{ formatAmount(entry) }}</span>
          </div>
          <span class="tl__date">{{ formatDate(entry.at) }}</span>
          <p v-if="entry.notes" class="tl__notes">{{ entry.notes }}</p>
          <span v-if="entry.evidence" class="tl__evidence">
            <i class="pi pi-paperclip" /> {{ entry.evidence }}
            {{ entry.evidence === 1 ? 'archivo' : 'archivos' }}
          </span>
        </div>
      </li>
    </ol>

    <div v-if="items.length < history.length || hasMore" class="tl__more">
      <Button
        label="Ver más"
        icon="pi pi-chevron-down"
        size="small"
        text
        severity="secondary"
        @click="showMore"
      />
    </div>
  </section>
</template>

<style scoped>
.tl__undo {
  margin-left: auto;
  font-size: 0.66rem !important;
  padding: 0.2rem 0.5rem !important;
  flex-shrink: 0;
}

.act-section-title .tl__undo + :deep(*) {
  display: none;
}

/* El ::after del título se desactiva cuando hay botón */
.tl .act-section-title::after {
  display: none;
}

/* Vacío */
.tl__empty {
  padding: 1.6rem 1.2rem;
  text-align: center;
}

.tl__empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.4rem;
}

.tl__empty-title {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--act-text);
}

.tl__empty-text {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--act-text-2);
  max-width: 34ch;
  margin-inline: auto;
}

/* Lista */
.tl__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.tl__item {
  display: flex;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  align-items: flex-start;
}

.tl__dot {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  background: var(--act-accent-soft);
  border: 1px solid var(--act-border);
}

.tl__emoji {
  font-size: 1rem;
}

.tl__body {
  flex: 1;
  min-width: 0;
}

.tl__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.tl__name {
  font-size: 0.83rem;
  font-weight: 700;
  color: var(--act-text);
}

.tl__amount {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--act-green-strong);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.activida-dark .tl__amount {
  color: var(--act-green);
}

.tl__date {
  display: block;
  font-size: 0.68rem;
  color: var(--act-text-3);
  margin-top: 0.1rem;
}

.tl__notes {
  margin: 0.35rem 0 0;
  font-size: 0.73rem;
  line-height: 1.45;
  color: var(--act-text-2);
  font-style: italic;
}

.tl__evidence {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.35rem;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--act-text-3);
}

.tl__more {
  margin: 0.7rem 0 0;
  text-align: center;
  font-size: 0.7rem;
  color: var(--act-text-3);
}
</style>
