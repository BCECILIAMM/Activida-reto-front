<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import ProgressRing from './ProgressRing.vue'

const props = defineProps({
  runner: { type: Object, required: true },
  completed: { type: Number, default: 0 },
  total: { type: Number, default: 10 },
  ratio: { type: Number, default: 0 },
  tier: { type: Object, default: null },
  nextTier: { type: Object, default: null }
})

const emit = defineEmits(['update:name'])

const name = computed({
  get: () => props.runner.name,
  set: (v) => emit('update:name', v)
})

const initial = computed(() => (props.runner.name || '').trim().charAt(0).toUpperCase() || '?')

const missing = computed(() =>
  props.nextTier ? Math.max(0, props.nextTier.min - props.completed) : 0
)
</script>

<template>
  <section class="runner act-panel act-rise">
    <!-- Dorsal / bib -->
    <div class="runner__bib">
      <span class="runner__bib-brand">ActiVida</span>
      <span class="runner__bib-num">{{ runner.bib }}</span>
      <span class="runner__bib-holes"><i /><i /></span>
    </div>

    <div class="runner__identity">
      <div class="runner__avatar">{{ initial }}</div>
      <div class="runner__fields">
        <label class="runner__label" for="runner-name">Corredora</label>
        <InputText
          id="runner-name"
          v-model="name"
          placeholder="Tu nombre"
          maxlength="28"
          class="runner__input"
          autocomplete="name"
        />
      </div>
    </div>

    <div class="runner__ring">
      <ProgressRing :value="ratio" :size="92" :stroke="8" gradient>
        <div class="runner__ring-inner">
          <span class="runner__ring-num">{{ completed }}</span>
          <span class="runner__ring-den">de {{ total }}</span>
        </div>
      </ProgressRing>
    </div>

    <div class="runner__tier">
      <Tag
        v-if="tier"
        :value="`${tier.emoji} ${tier.label}`"
        class="runner__tag"
        :style="{ '--tier-color': tier.color }"
      />
      <Tag v-else value="Sin nivel aún" severity="secondary" class="runner__tag runner__tag--empty" />

      <p v-if="nextTier && missing > 0" class="runner__hint">
        Te {{ missing === 1 ? 'falta' : 'faltan' }}
        <strong>{{ missing }}</strong>
        {{ missing === 1 ? 'badge' : 'badges' }} para
        <strong>{{ nextTier.emoji }} {{ nextTier.label }}</strong>
      </p>
      <p v-else-if="!nextTier" class="runner__hint runner__hint--max">
        ¡Nivel máximo alcanzado! 🎉
      </p>
    </div>
  </section>
</template>

<style scoped>
.runner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'bib  bib'
    'id   ring'
    'tier tier';
  gap: 0.7rem 0.9rem;
  align-items: center;
  padding: 0.85rem 1rem 1rem;
  margin: 1rem;
  overflow: hidden;
}

/* --- Dorsal --- */
.runner__bib {
  grid-area: bib;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.7rem;
  border-radius: 10px;
  background: var(--act-accent-soft);
  border: 1px dashed var(--act-accent-line);
}

.runner__bib-brand {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--act-green-strong);
}

.activida-dark .runner__bib-brand {
  color: var(--act-green);
}

.runner__bib-num {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
  color: var(--act-text);
}

.runner__bib-holes {
  display: inline-flex;
  gap: 0.3rem;
}

.runner__bib-holes i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--act-border-strong);
}

/* --- Identidad --- */
.runner__identity {
  grid-area: id;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.runner__avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--act-green-deep), var(--act-green));
  color: var(--act-on-accent);
  font-size: 1.1rem;
  font-weight: 800;
  box-shadow: 0 8px 18px -8px rgba(10, 164, 71, 0.8);
}

.runner__fields {
  min-width: 0;
  flex: 1;
}

.runner__label {
  display: block;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-bottom: 0.15rem;
}

.runner__input {
  width: 100%;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.35rem 0.5rem !important;
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  margin-left: -0.5rem;
}

.runner__input:hover,
.runner__input:focus {
  background: var(--act-panel-2) !important;
  border-color: var(--act-border) !important;
}

/* --- Nivel --- */
.runner__tier {
  grid-area: tier;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--act-border);
}

.runner__tag {
  background: color-mix(in srgb, var(--tier-color, var(--act-green)) 16%, transparent) !important;
  color: var(--tier-color, var(--act-green)) !important;
  border: 1px solid color-mix(in srgb, var(--tier-color, var(--act-green)) 40%, transparent) !important;
  font-size: 0.72rem !important;
}

.runner__tag--empty {
  background: var(--act-track) !important;
  color: var(--act-text-3) !important;
  border-color: var(--act-border) !important;
}

.runner__hint {
  margin: 0;
  font-size: 0.72rem;
  color: var(--act-text-2);
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.runner__hint strong {
  color: var(--act-text);
}

.runner__hint--max {
  color: var(--act-green-strong);
  font-weight: 700;
}

/* --- Anillo --- */
.runner__ring {
  grid-area: ring;
  display: grid;
  place-items: center;
}

.runner__ring-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
}

.runner__ring-num {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  color: var(--act-text);
  font-variant-numeric: tabular-nums;
}

.runner__ring-den {
  font-size: 0.62rem;
  color: var(--act-text-3);
  font-weight: 700;
  letter-spacing: 0.04em;
}

@media (min-width: 520px) {
  .runner {
    padding: 1rem 1.25rem 1.25rem;
  }
  .runner__ring-num {
    font-size: 1.8rem;
  }
}
</style>
