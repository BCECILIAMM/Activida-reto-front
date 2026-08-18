<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import ProgressRing from './ProgressRing.vue'

const props = defineProps({
  badge: { type: Object, required: true },
  ratio: { type: Number, default: 0 },
  valueLabel: { type: String, default: '' },
  done: { type: Boolean, default: false }
})

const emit = defineEmits(['log', 'info'])

const sourceMeta = computed(() => {
  switch (props.badge.source) {
    case 'device':
      return { icon: 'pi-watch', text: 'Reloj o app' }
    case 'photo':
      return { icon: 'pi-camera', text: 'Con evidencia' }
    case 'manual':
      return { icon: 'pi-pencil', text: 'Manual' }
    default:
      return { icon: 'pi-lock', text: 'Automático' }
  }
})

/** En 0% el color de acento se lee como error; mejor mantenerlo neutro. */
const started = computed(() => props.ratio > 0)
</script>

<template>
  <article
    class="bcard act-panel"
    :class="{ 'is-done': done, 'is-master': badge.master }"
    :style="{ '--badge-color': badge.color }"
  >
    <button class="bcard__info" type="button" aria-label="Cómo se consigue" @click="emit('info', badge)">
      <i class="pi pi-info-circle" />
    </button>

    <div class="bcard__head">
      <ProgressRing :value="ratio" :size="48" :stroke="4" color="var(--badge-color)">
        <span class="bcard__emoji">{{ badge.emoji }}</span>
      </ProgressRing>
    </div>

    <h3 class="bcard__name">{{ badge.name }}</h3>
    <span class="bcard__cat">{{ badge.cat }}</span>

    <span class="bcard__source">
      <i :class="['pi', sourceMeta.icon]" /> {{ sourceMeta.text }}
    </span>

    <p class="bcard__desc">{{ badge.desc }}</p>

    <div class="bcard__meter">
      <div class="bcard__meter-head">
        <span class="bcard__value">{{ valueLabel }}</span>
        <span class="bcard__pct" :class="{ 'is-idle': !started }">{{ Math.round(ratio * 100) }}%</span>
      </div>
      <div class="bcard__bar">
        <div class="bcard__bar-fill" :style="{ width: ratio * 100 + '%' }" />
      </div>
    </div>

    <div class="bcard__foot">
      <Button
        v-if="badge.type !== 'auto'"
        size="small"
        rounded
        fluid
        :severity="done ? 'secondary' : undefined"
        :outlined="done"
        :label="done ? 'Sumar más' : 'Registrar'"
        :icon="done ? 'pi pi-plus' : 'pi pi-plus-circle'"
        class="bcard__btn"
        @click="emit('log', badge)"
      />

      <span v-else class="bcard__auto" :class="{ 'is-done': done }">
        <i :class="['pi', done ? 'pi-verified' : 'pi-lock']" />
        {{ done ? 'Badge conseguido' : 'Se desbloquea solo' }}
      </span>
    </div>

    <transition name="stamp">
      <div v-if="done" class="bcard__stamp" aria-hidden="true">
        <i class="pi pi-check" />
      </div>
    </transition>
  </article>
</template>

<style scoped>
.bcard {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0.85rem;
  overflow: hidden;
}

.bcard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 100% 0%,
    color-mix(in srgb, var(--badge-color) 12%, transparent),
    transparent 62%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.bcard:hover::before {
  opacity: 1;
}

.bcard:hover {
  transform: translateY(-2px);
  box-shadow: var(--act-shadow-lift);
  border-color: color-mix(in srgb, var(--badge-color) 35%, var(--act-border));
}

.bcard.is-done {
  border-color: color-mix(in srgb, var(--badge-color) 45%, transparent);
  background: color-mix(in srgb, var(--badge-color) 6%, var(--act-panel));
}

.bcard.is-done::before {
  opacity: 1;
}

.bcard.is-master {
  grid-column: 1 / -1;
  border-style: solid;
  border-color: color-mix(in srgb, var(--badge-color) 40%, var(--act-border));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--badge-color) 9%, var(--act-panel)),
    var(--act-panel) 65%
  );
}

/* Botón de info */
.bcard__info {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--act-text-3);
  cursor: pointer;
  font-size: 0.8rem;
  transition: color 0.2s, background 0.2s;
  z-index: 2;
}

.bcard__info:hover {
  color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 12%, transparent);
}

/* Cabecera: el anillo va arriba y el título ocupa todo el ancho.
   Así "Strong Runner" o "180 Min" caben en una sola línea en móvil. */
.bcard__head {
  display: flex;
  align-items: center;
  margin-bottom: 0.55rem;
}

.bcard__emoji {
  font-size: 1.15rem;
  line-height: 1;
}

.bcard__name {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.15;
  color: var(--act-text);
  overflow-wrap: break-word;
}

.bcard__cat {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bcard__desc {
  margin: 0.5rem 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--act-text-2);
  flex: 1;
}

/* Medidor */
.bcard__meter {
  margin-top: 0.7rem;
}

.bcard__meter-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.28rem;
}

.bcard__value {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--act-text);
  font-variant-numeric: tabular-nums;
}

.bcard__pct {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--badge-color);
  font-variant-numeric: tabular-nums;
}

.bcard__pct.is-idle {
  color: var(--act-text-3);
}

.bcard__bar {
  height: 5px;
  border-radius: 99px;
  background: var(--act-track);
  overflow: hidden;
}

.bcard__bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--badge-color) 55%, transparent),
    var(--badge-color)
  );
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Cómo se comprueba: va arriba y con el ancho completo de la tarjeta,
   así el texto nunca se recorta en pantallas angostas. */
.bcard__source {
  display: inline-flex;
  align-items: center;
  /* la tarjeta es flex en columna: sin esto el chip se estiraría a todo el ancho */
  align-self: flex-start;
  gap: 0.28rem;
  margin-top: 0.45rem;
  padding: 0.18rem 0.5rem;
  border-radius: 99px;
  background: var(--act-track);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--act-text-3);
  white-space: nowrap;
}

.bcard__source .pi {
  font-size: 0.6rem;
}

/* Pie: botón a todo lo ancho, más fácil de tocar con el pulgar */
.bcard__foot {
  margin-top: 0.8rem;
}

.bcard__btn {
  font-size: 0.72rem !important;
  padding: 0.42rem 0.7rem !important;
  gap: 0.3rem !important;
  white-space: nowrap;
}

.bcard__btn :deep(.p-button-label) {
  white-space: nowrap;
  font-weight: 800;
}

.bcard__btn :deep(.pi) {
  font-size: 0.72rem;
}

.bcard__auto {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.42rem 0.7rem;
  border-radius: 99px;
  background: var(--act-track);
  color: var(--act-text-3);
}

.bcard__auto.is-done {
  background: color-mix(in srgb, var(--badge-color) 16%, transparent);
  color: var(--badge-color);
}

/* Sello de completado */
.bcard__stamp {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--badge-color);
  color: #04140a;
  font-size: 0.6rem;
  font-weight: 900;
  box-shadow: 0 4px 10px -3px color-mix(in srgb, var(--badge-color) 80%, transparent);
  z-index: 2;
}

.stamp-enter-active {
  animation: stamp-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes stamp-in {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

@media (min-width: 520px) {
  .bcard {
    padding: 1rem;
  }
  .bcard__name {
    font-size: 0.95rem;
  }
  .bcard__desc {
    font-size: 0.78rem;
  }
}
</style>
