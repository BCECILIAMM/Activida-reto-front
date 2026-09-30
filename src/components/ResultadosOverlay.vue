<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import MedallaReto from './MedallaReto.vue'
import { LUGARES } from '../data/resultados.js'

/**
 * Aviso de cierre del reto. A quien quedó en el podio le dice su lugar con su
 * medalla; a todas las personas les muestra la imagen del podio y el
 * agradecimiento por participar.
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  lugar: { type: Number, default: null },
  nombre: { type: String, default: '' },
  mes: { type: String, default: '' },
  anio: { type: [Number, String], default: '' },
  imagen: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const primerNombre = computed(() => (props.nombre || '').trim().split(/\s+/)[0] || '')
const imagenUrl = computed(() => (props.imagen ? import.meta.env.BASE_URL + props.imagen : ''))
const archivo = computed(() =>
  `podio-reto-activida-${props.mes}-${props.anio}.jpg`.toLowerCase().replace(/\s+/g, '-')
)

const confetti = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 4.9 + (i % 3) * 5) % 100,
  delay: (i % 7) * 0.14,
  duration: 1.8 + (i % 4) * 0.4,
  color: ['#23964d', '#eaa412', '#1d7fd1', '#2ee56f', '#ffffff'][i % 5],
  size: 6 + (i % 3) * 3
}))
</script>

<template>
  <transition name="pop">
    <div v-if="visible" class="res" role="dialog" aria-modal="true" aria-labelledby="res-titulo" @click.self="emit('close')">
      <template v-if="lugar">
        <span
          v-for="(c, i) in confetti"
          :key="i"
          class="res__confetti"
          :style="{
            left: c.left + '%',
            background: c.color,
            animationDelay: c.delay + 's',
            animationDuration: c.duration + 's',
            width: c.size + 'px',
            height: c.size + 'px'
          }"
        />
      </template>

      <div class="res__card">
        <span class="res__kicker">Resultados · Reto {{ mes }} {{ anio }}</span>

        <template v-if="lugar">
          <div class="res__medalla">
            <MedallaReto :lugar="lugar" :mes="mes" :anio="anio" />
          </div>
          <h2 id="res-titulo" class="res__titulo">
            ¡Felicidades{{ primerNombre ? `, ${primerNombre}` : '' }}!
          </h2>
          <p class="res__lead">
            Quedaste en <strong>{{ LUGARES[lugar - 1] }}</strong> del Reto ActiVida de {{ mes }}.
          </p>
        </template>

        <template v-else>
          <span class="res__meta" aria-hidden="true">🏁</span>
          <h2 id="res-titulo" class="res__titulo">¡Terminamos el reto!</h2>
          <p class="res__lead">Ya están los resultados del Reto ActiVida de {{ mes }}.</p>
        </template>

        <a v-if="imagenUrl" class="res__podio" :href="imagenUrl" target="_blank" rel="noopener">
          <img :src="imagenUrl" :alt="`Podio del Reto ActiVida de ${mes}: los tres primeros lugares`" />
        </a>

        <div class="res__gracias">
          <i class="pi pi-heart-fill" aria-hidden="true" />
          <p>
            <strong>Gracias a todas las personas que se sumaron al reto.</strong>
            Cada kilómetro, cada sesión de fuerza y cada día que decidieron salir a moverse cuenta.
            El podio tiene tres lugares, pero el hábito que construimos en equipo es de cada persona
            que participó. ¡Nos vemos en el próximo reto!
          </p>
        </div>

        <div class="res__acciones">
          <Button
            v-if="imagenUrl"
            as="a"
            :href="imagenUrl"
            :download="archivo"
            label="Descargar imagen"
            icon="pi pi-download"
            severity="secondary"
            outlined
            rounded
            fluid
          />
          <Button label="¡Gracias!" icon="pi pi-check" rounded fluid class="res__btn" @click="emit('close')" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.res {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(3, 10, 6, 0.72);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.res__card {
  position: relative;
  width: 100%;
  max-width: 380px;
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  padding: 1.4rem 1.25rem 1.25rem;
  text-align: center;
  border-radius: 24px;
  background: var(--act-panel);
  border: 1px solid var(--act-border);
  box-shadow: 0 30px 60px -25px rgba(0, 0, 0, 0.8);
}

.res__kicker {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--act-green-strong);
}

:global(.activida-dark) .res__kicker {
  color: var(--act-green);
}

.res__medalla {
  width: 132px;
  margin: 0.6rem auto 0.4rem;
  filter: drop-shadow(0 10px 16px rgba(10, 39, 80, 0.35));
  animation: bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0% { transform: scale(0) rotate(-18deg); }
  60% { transform: scale(1.1) rotate(4deg); }
  100% { transform: scale(1) rotate(0); }
}

.res__meta {
  display: block;
  font-size: 2.6rem;
  margin: 0.5rem 0 0.2rem;
}

.res__titulo {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--act-text);
}

.res__lead {
  margin: 0.3rem 0 0;
  font-size: 0.86rem;
  line-height: 1.45;
  color: var(--act-text-2);
}

.res__lead strong {
  color: var(--act-text);
}

.res__podio {
  display: block;
  margin-top: 1rem;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--act-border);
  box-shadow: var(--act-shadow);
}

.res__podio img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  background: #0e3569;
}

.res__gracias {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  padding: 0.8rem 0.9rem;
  text-align: left;
  border-radius: 14px;
  background: var(--act-accent-soft);
  border: 1px solid var(--act-accent-line);
}

.res__gracias .pi {
  flex-shrink: 0;
  margin-top: 0.15rem;
  font-size: 0.85rem;
  color: var(--act-green-strong);
}

.res__gracias p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--act-text-2);
}

.res__gracias strong {
  color: var(--act-text);
}

.res__acciones {
  display: grid;
  gap: 0.55rem;
  margin-top: 1rem;
}

.res__btn {
  font-weight: 800 !important;
}

/* Confeti */
.res__confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  pointer-events: none;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
}

.pop-enter-active { transition: opacity 0.25s ease; }
.pop-leave-active { transition: opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
</style>
