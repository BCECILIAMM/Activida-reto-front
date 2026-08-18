<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  badge: { type: Object, default: null },
  tier: { type: Object, default: null }
})

const emit = defineEmits(['close'])

/** Confeti generado con posiciones deterministas para no depender de Math.random en render */
const confetti = computed(() =>
  Array.from({ length: 18 }, (_, i) => ({
    left: (i * 5.7 + (i % 3) * 4) % 100,
    delay: (i % 6) * 0.12,
    duration: 1.6 + (i % 4) * 0.35,
    color: ['#2ee56f', '#eaa412', '#38bdf8', '#f43f5e', '#c084fc'][i % 5],
    size: 6 + (i % 3) * 3
  }))
)
</script>

<template>
  <transition name="pop">
    <div v-if="badge" class="unlock" role="dialog" aria-live="polite" @click.self="emit('close')">
      <span
        v-for="(c, i) in confetti"
        :key="i"
        class="unlock__confetti"
        :style="{
          left: c.left + '%',
          background: c.color,
          animationDelay: c.delay + 's',
          animationDuration: c.duration + 's',
          width: c.size + 'px',
          height: c.size + 'px'
        }"
      />

      <div class="unlock__card" :style="{ '--badge-color': badge.color }">
        <span class="unlock__kicker">Badge desbloqueado</span>

        <div class="unlock__medal">
          <span class="unlock__glow" />
          <span class="unlock__emoji">{{ badge.emoji }}</span>
        </div>

        <h2 class="unlock__name">{{ badge.name }}</h2>
        <p class="unlock__desc">{{ badge.desc }}</p>

        <div v-if="tier" class="unlock__tier" :style="{ '--tier-color': tier.color }">
          <i class="pi pi-arrow-up-right" />
          Subiste a nivel <strong>{{ tier.emoji }} {{ tier.label }}</strong>
        </div>

        <Button label="¡Vamos!" icon="pi pi-check" rounded fluid class="unlock__btn" @click="emit('close')" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.unlock {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(3, 10, 6, 0.72);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.unlock__card {
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: 1.5rem 1.4rem 1.3rem;
  text-align: center;
  border-radius: 24px;
  background: var(--act-panel);
  border: 1px solid color-mix(in srgb, var(--badge-color) 35%, var(--act-border));
  box-shadow: 0 30px 60px -25px rgba(0, 0, 0, 0.8);
}

.unlock__kicker {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--badge-color);
}

.unlock__medal {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  margin: 0.85rem auto 0.9rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--badge-color) 12%, transparent);
  border: 2px solid color-mix(in srgb, var(--badge-color) 45%, transparent);
}

.unlock__glow {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--badge-color) 40%, transparent), transparent 68%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.14); opacity: 0.9; }
}

.unlock__emoji {
  position: relative;
  font-size: 2.8rem;
  animation: bounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0% { transform: scale(0) rotate(-25deg); }
  60% { transform: scale(1.18) rotate(6deg); }
  100% { transform: scale(1) rotate(0); }
}

.unlock__name {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--act-text);
}

.unlock__desc {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--act-text-2);
}

.unlock__tier {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.9rem;
  padding: 0.4rem 0.85rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tier-color);
  background: color-mix(in srgb, var(--tier-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tier-color) 32%, transparent);
}

.unlock__btn {
  margin-top: 1.15rem;
  font-weight: 800 !important;
}

/* Confeti */
.unlock__confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
}

/* Transición */
.pop-enter-active { transition: opacity 0.25s ease; }
.pop-leave-active { transition: opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
</style>
