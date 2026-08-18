<script setup>
import { computed } from 'vue'

const props = defineProps({
  tiers: { type: Array, required: true },
  completed: { type: Number, default: 0 },
  total: { type: Number, default: 10 },
  currentTier: { type: Object, default: null }
})

/** Porcentaje de avance de la línea que conecta las medallas */
const lineWidth = computed(() => {
  const max = props.tiers[props.tiers.length - 1].min
  return Math.max(0, Math.min(1, props.completed / max)) * 100
})

const reached = (tier) => props.completed >= tier.min
const isCurrent = (tier) => props.currentTier?.id === tier.id
</script>

<template>
  <section class="tiers act-section">
    <h2 class="act-section-title">
      <i class="pi pi-trophy" /> Niveles del reto
    </h2>

    <div class="tiers__rail">
      <div class="tiers__line">
        <div class="tiers__line-fill" :style="{ width: lineWidth + '%' }" />
      </div>

      <div class="tiers__row">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="tier"
          :class="{ 'is-reached': reached(tier), 'is-current': isCurrent(tier) }"
          :style="{ '--tier-color': tier.color }"
        >
          <div class="tier__medal">
            <span class="tier__emoji">{{ tier.emoji }}</span>
            <i v-if="reached(tier)" class="pi pi-check-circle tier__check" />
          </div>
          <span class="tier__label">{{ tier.label }}</span>
          <span class="tier__req">{{ tier.min === total ? 'Todos' : tier.min + ' badges' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tiers__rail {
  position: relative;
  padding: 0.25rem 0 0;
}

/* Línea de meta que conecta los niveles */
.tiers__line {
  position: absolute;
  top: 30px;
  left: 12%;
  right: 12%;
  height: 4px;
  background: var(--act-track);
  border-radius: 99px;
  overflow: hidden;
}

.tiers__line-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--act-green-deep), var(--act-green));
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.tiers__row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.tier {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
}

.tier__medal {
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--act-panel);
  border: 2px solid var(--act-border);
  box-shadow: var(--act-shadow);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.tier__emoji {
  font-size: 1.4rem;
  filter: grayscale(1) opacity(0.45);
  transition: filter 0.35s;
}

.tier.is-reached .tier__medal {
  border-color: color-mix(in srgb, var(--tier-color) 55%, transparent);
  background: color-mix(in srgb, var(--tier-color) 12%, var(--act-panel));
}

.tier.is-reached .tier__emoji {
  filter: none;
}

.tier.is-current .tier__medal {
  transform: scale(1.12);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--tier-color) 18%, transparent), var(--act-shadow-lift);
}

.tier__check {
  position: absolute;
  right: -3px;
  bottom: -3px;
  font-size: 0.85rem;
  color: var(--tier-color);
  background: var(--act-panel);
  border-radius: 50%;
}

.tier__label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--act-text-3);
}

.tier.is-reached .tier__label {
  color: var(--act-text);
}

.tier__req {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--act-text-3);
}

.tier.is-reached .tier__req {
  color: var(--tier-color);
}

@media (min-width: 520px) {
  .tier__medal {
    width: 60px;
    height: 60px;
  }
  .tier__emoji {
    font-size: 1.6rem;
  }
  .tiers__line {
    top: 34px;
  }
}
</style>
