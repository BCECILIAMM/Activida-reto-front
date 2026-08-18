<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Valor entre 0 y 1 */
  value: { type: Number, default: 0 },
  size: { type: Number, default: 64 },
  stroke: { type: Number, default: 6 },
  color: { type: String, default: 'var(--act-green)' },
  trackColor: { type: String, default: 'var(--act-track)' },
  /** Añade un degradado sutil al arco */
  gradient: { type: Boolean, default: false }
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - Math.max(0, Math.min(1, props.value))))
const gradientId = `ring-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
      <defs v-if="gradient">
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color" stop-opacity="0.55" />
          <stop offset="100%" :stop-color="color" />
        </linearGradient>
      </defs>

      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="stroke"
      />
      <circle
        class="ring__arc"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="gradient ? `url(#${gradientId})` : color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}

.ring svg {
  position: absolute;
  inset: 0;
}

.ring__arc {
  transition: stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.ring__content {
  position: relative;
  display: grid;
  place-items: center;
  text-align: center;
  line-height: 1;
}
</style>
