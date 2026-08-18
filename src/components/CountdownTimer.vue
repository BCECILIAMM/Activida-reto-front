<script setup>
defineProps({
  parts: { type: Object, required: true },
  monthProgress: { type: Number, default: 0 },
  finished: { type: Boolean, default: false }
})
</script>

<template>
  <div class="cd">
    <div v-if="finished" class="cd__done">
      <i class="pi pi-flag-fill" />
      <span>El reto terminó — ¡buen trabajo!</span>
    </div>

    <template v-else>
      <div class="cd__boxes">
        <div class="cd__box">
          <span class="cd__num">{{ parts.days }}</span>
          <span class="cd__lbl">días</span>
        </div>
        <span class="cd__sep">:</span>
        <div class="cd__box">
          <span class="cd__num">{{ parts.hours }}</span>
          <span class="cd__lbl">hrs</span>
        </div>
        <span class="cd__sep">:</span>
        <div class="cd__box">
          <span class="cd__num">{{ parts.minutes }}</span>
          <span class="cd__lbl">min</span>
        </div>
      </div>

      <div class="cd__track" role="img" :aria-label="`Mes ${Math.round(monthProgress * 100)}% transcurrido`">
        <div class="cd__track-fill" :style="{ width: monthProgress * 100 + '%' }">
          <span class="cd__runner">🏃</span>
        </div>
      </div>
      <p class="cd__caption">para cerrar el mes</p>
    </template>
  </div>
</template>

<style scoped>
.cd {
  position: relative;
  margin-top: 0.9rem;
}

.cd__boxes {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cd__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 58px;
  padding: 0.5rem 0.6rem;
  background: var(--act-panel);
  border: 1px solid var(--act-border);
  border-radius: 14px;
  box-shadow: var(--act-shadow);
}

.cd__num {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--act-green-strong);
  font-variant-numeric: tabular-nums;
}

.activida-dark .cd__num {
  color: var(--act-green);
}

.cd__lbl {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--act-text-3);
  margin-top: 0.2rem;
  font-weight: 700;
}

.cd__sep {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--act-text-3);
  margin-top: -0.6rem;
}

/* Barra tipo pista con el corredor avanzando */
.cd__track {
  position: relative;
  height: 6px;
  margin: 1rem auto 0;
  max-width: 260px;
  background: var(--act-track);
  border-radius: 99px;
  overflow: visible;
}

.cd__track-fill {
  position: relative;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--act-green-deep), var(--act-green));
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 4px;
}

.cd__runner {
  position: absolute;
  right: -10px;
  top: -13px;
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}

.cd__caption {
  margin: 0.45rem 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--act-text-3);
  font-weight: 600;
}

.cd__done {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 99px;
  background: var(--act-accent-soft);
  border: 1px solid var(--act-accent-line);
  color: var(--act-green-strong);
  font-weight: 700;
  font-size: 0.85rem;
}
</style>
