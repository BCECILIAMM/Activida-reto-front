<script setup>
import BadgeCard from './BadgeCard.vue'

defineProps({
  badges: { type: Array, required: true },
  ratioFn: { type: Function, required: true },
  labelFn: { type: Function, required: true },
  doneFn: { type: Function, required: true }
})

const emit = defineEmits(['log', 'info'])
</script>

<template>
  <section class="grid-wrap act-section">
    <h2 class="act-section-title">
      <i class="pi pi-star-fill" /> Tus badges
    </h2>

    <div class="bgrid">
      <BadgeCard
        v-for="(badge, i) in badges"
        :key="badge.id"
        :badge="badge"
        :ratio="ratioFn(badge)"
        :value-label="labelFn(badge)"
        :done="doneFn(badge)"
        class="act-rise"
        :style="{ animationDelay: Math.min(i * 45, 400) + 'ms' }"
        @log="emit('log', $event)"
        @info="emit('info', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.bgrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

@media (min-width: 560px) {
  .bgrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
}

@media (min-width: 820px) {
  .bgrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
