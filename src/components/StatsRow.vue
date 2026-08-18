<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, required: true }
})

const items = computed(() => [
  { key: 'km', icon: 'pi-map', label: 'Kilómetros', value: props.stats.km, suffix: 'km', color: 'var(--act-green)' },
  { key: 'min', icon: 'pi-clock', label: 'Minutos', value: props.stats.minutes, suffix: 'min', color: '#38bdf8' },
  { key: 'elev', icon: 'pi-chart-line', label: 'Desnivel', value: props.stats.elevation, suffix: 'm D+', color: '#c084fc' },
  { key: 'ses', icon: 'pi-check-circle', label: 'Registros', value: props.stats.sessions, suffix: '', color: '#fb923c' }
])
</script>

<template>
  <section class="stats act-section">
    <div class="stats__grid">
      <div v-for="item in items" :key="item.key" class="stat act-panel" :style="{ '--stat-color': item.color }">
        <span class="stat__icon"><i :class="['pi', item.icon]" /></span>
        <span class="stat__value">
          {{ item.value }}<small v-if="item.suffix">{{ item.suffix }}</small>
        </span>
        <span class="stat__label">{{ item.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  margin-top: 1rem;
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.7rem 0.55rem;
  border-radius: 14px;
}

.stat__icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--stat-color) 14%, transparent);
  color: var(--stat-color);
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}

.stat__value {
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--act-text);
  font-variant-numeric: tabular-nums;
}

.stat__value small {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--act-text-3);
  margin-left: 0.12rem;
}

.stat__label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--act-text-3);
}

@media (max-width: 380px) {
  .stats__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
