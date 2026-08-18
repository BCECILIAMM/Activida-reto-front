<script setup>
import CountdownTimer from './CountdownTimer.vue'
import ThemeToggle from './ThemeToggle.vue'

defineProps({
  challenge: { type: Object, required: true },
  parts: { type: Object, required: true },
  monthProgress: { type: Number, default: 0 },
  finished: { type: Boolean, default: false }
})
</script>

<template>
  <header class="hdr">
    <div class="act-track-lines" />

    <div class="hdr__bar">
      <div class="hdr__brand">
        <span class="hdr__mark">
          <i class="pi pi-bolt" />
        </span>
        <span class="hdr__wordmark">Acti<em>Vida</em></span>
      </div>
      <ThemeToggle />
    </div>

    <div class="hdr__body">
      <span class="hdr__chip">
        <i class="pi pi-calendar" />
        {{ challenge.month }} {{ challenge.year }}
      </span>
      <h1 class="hdr__title">{{ challenge.title }}</h1>
      <p class="hdr__sub">{{ challenge.subtitle }}</p>

      <CountdownTimer :parts="parts" :month-progress="monthProgress" :finished="finished" />
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: relative;
  overflow: hidden;
  padding: 0.75rem 1rem 1.6rem;
  background: var(--act-header-grad);
  border-bottom: 1px solid var(--act-border);
  text-align: center;
}

.hdr__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.hdr__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hdr__mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--act-green-strong), var(--act-green));
  color: var(--act-on-accent);
  font-size: 0.85rem;
  box-shadow: 0 6px 16px -6px rgba(10, 164, 71, 0.7);
}

.hdr__wordmark {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--act-text);
}

.hdr__wordmark em {
  font-style: normal;
  color: var(--act-green-strong);
}

.activida-dark .hdr__wordmark em {
  color: var(--act-green);
}

.hdr__body {
  position: relative;
  margin-top: 1.1rem;
}

.hdr__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  background: var(--act-accent-soft);
  border: 1px solid var(--act-accent-line);
  color: var(--act-green-strong);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.activida-dark .hdr__chip {
  color: var(--act-green);
}

.hdr__title {
  margin: 0.55rem 0 0;
  font-size: clamp(1.6rem, 7vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.hdr__sub {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: var(--act-text-2);
}

@media (min-width: 640px) {
  .hdr {
    padding-bottom: 2rem;
  }
}
</style>
