<script setup>
import Button from 'primevue/button'
import MedallaReto from './MedallaReto.vue'
import { LUGARES } from '../data/resultados.js'

/** Acceso permanente a los resultados desde "Mi reto", una vez cerrado el aviso. */
defineProps({
  lugar: { type: Number, default: null },
  mes: { type: String, default: '' },
  anio: { type: [Number, String], default: '' }
})

const emit = defineEmits(['open'])
</script>

<template>
  <section class="rc act-panel">
    <div class="rc__icono">
      <MedallaReto v-if="lugar" :lugar="lugar" :mes="mes" :anio="anio" />
      <span v-else aria-hidden="true">🏆</span>
    </div>
    <div class="rc__texto">
      <span class="rc__titulo">
        <template v-if="lugar">Quedaste en {{ LUGARES[lugar - 1] }}</template>
        <template v-else>Ya están los resultados</template>
      </span>
      <span class="rc__sub">Mira el podio del Reto {{ mes }} {{ anio }}.</span>
    </div>
    <Button label="Ver" icon="pi pi-trophy" size="small" rounded class="rc__btn" @click="emit('open')" />
  </section>
</template>

<style scoped>
.rc {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.75rem 1rem 0;
  padding: 0.75rem 0.9rem;
  border-color: color-mix(in srgb, var(--act-gold) 40%, var(--act-border));
}

.rc__icono {
  flex-shrink: 0;
  width: 44px;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
}

.rc__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.rc__titulo {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--act-text);
}

.rc__sub {
  font-size: 0.74rem;
  color: var(--act-text-2);
}

.rc__btn {
  flex-shrink: 0;
  font-weight: 800 !important;
}
</style>
