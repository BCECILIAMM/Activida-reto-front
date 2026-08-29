<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['sync'])
const loading = ref(false)

function handleSync() {
  if (props.disabled) return
  loading.value = true
  // Demo: simula la latencia de una llamada a Strava/Garmin antes de mandar
  // datos de ejemplo al endpoint real de sincronización.
  setTimeout(() => {
    loading.value = false
    emit('sync')
  }, 900)
}
</script>

<template>
  <section class="sync act-section">
    <div class="sync__card act-panel">
      <div class="sync__icons">
        <span class="sync__icon sync__icon--strava"><i class="pi pi-bolt" /></span>
        <span class="sync__icon sync__icon--garmin"><i class="pi pi-stopwatch" /></span>
      </div>

      <div class="sync__text">
        <strong class="sync__title">Sincroniza tu reloj</strong>
        <span class="sync__sub">Demo: importa una carrera de ejemplo (km, min y D+)</span>
      </div>

      <Button
        :label="loading ? 'Sincronizando…' : 'Probar'"
        :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-sync'"
        size="small"
        rounded
        :disabled="loading || disabled"
        class="sync__btn"
        @click="handleSync"
      />
    </div>
  </section>
</template>

<style scoped>
.sync {
  margin-top: 1rem;
}

.sync__card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  background: linear-gradient(135deg, rgba(252, 76, 2, 0.09), transparent 65%), var(--act-panel);
  border-color: color-mix(in srgb, #fc4c02 22%, var(--act-border));
}

.sync__icons {
  display: flex;
  flex-shrink: 0;
}

.sync__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #fff;
  border: 2px solid var(--act-panel);
}

.sync__icon--strava {
  background: #fc4c02;
}

.sync__icon--garmin {
  background: #007cc3;
  margin-left: -10px;
}

.sync__text {
  flex: 1;
  min-width: 0;
}

.sync__title {
  display: block;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--act-text);
  line-height: 1.2;
}

.sync__sub {
  display: block;
  font-size: 0.68rem;
  color: var(--act-text-3);
  margin-top: 0.1rem;
}

.sync__btn {
  flex-shrink: 0;
  font-size: 0.7rem !important;
  padding: 0.35rem 0.8rem !important;
  background: #fc4c02 !important;
  border-color: #fc4c02 !important;
  color: #fff !important;
}

.sync__btn:not(:disabled):hover {
  background: #e04402 !important;
  border-color: #e04402 !important;
}

@media (max-width: 400px) {
  .sync__sub {
    display: none;
  }
}
</style>
