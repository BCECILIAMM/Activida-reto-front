<script setup>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

defineProps({
  visible: { type: Boolean, default: false },
  badge: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'log'])
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    dismissable-mask
    class="act-sheet"
    :style="{ width: '380px' }"
    :breakpoints="{ '640px': '100vw' }"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div v-if="badge" class="info__header" :style="{ '--badge-color': badge.color }">
        <span class="info__emoji">{{ badge.emoji }}</span>
        <h3 class="info__title">{{ badge.name }}</h3>
      </div>
    </template>

    <div v-if="badge" class="info" :style="{ '--badge-color': badge.color }">
      <div class="info__block">
        <span class="info__label">El reto</span>
        <p class="info__text">{{ badge.desc }}</p>
      </div>

      <div class="info__block">
        <span class="info__label">Cómo se consigue</span>
        <p class="info__text">{{ badge.how }}</p>
      </div>

      <div class="info__meta">
        <span class="info__pill">
          <i class="pi pi-flag" /> Meta: {{ badge.goal }}{{ badge.unit ? ' ' + badge.unit : '' }}
        </span>
        <span v-if="badge.source === 'device'" class="info__pill">
          <i class="pi pi-watch" /> Sincronizable
        </span>
        <span v-if="badge.source === 'photo'" class="info__pill">
          <i class="pi pi-camera" /> Requiere evidencia
        </span>
      </div>
    </div>

    <template #footer>
      <Button
        v-if="badge && badge.type !== 'auto'"
        label="Registrar actividad"
        icon="pi pi-plus-circle"
        rounded
        fluid
        @click="emit('log', badge); emit('update:visible', false)"
      />
      <Button v-else label="Entendido" severity="secondary" rounded fluid @click="emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<style scoped>
.info__header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.info__emoji {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 13px;
  font-size: 1.3rem;
  background: color-mix(in srgb, var(--badge-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
}

.info__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.info__block {
  margin-bottom: 1rem;
}

.info__label {
  display: block;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-bottom: 0.3rem;
}

.info__text {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--act-text-2);
}

.info__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.info__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 99px;
  background: color-mix(in srgb, var(--badge-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 25%, transparent);
  color: var(--badge-color);
  font-size: 0.68rem;
  font-weight: 700;
}
</style>
