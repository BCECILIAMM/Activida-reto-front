<script setup>
import { computed, useId } from 'vue'
import corredores from '../assets/medalla-corredores.png'

/**
 * Medalla de corredor de ActiVida: cinta verde y azul, disco con las
 * siluetas del logo y el nombre del reto grabado en el borde.
 * Es la misma medalla de la imagen del podio que se comparte en redes.
 */
const props = defineProps({
  lugar: { type: Number, default: 1 }, // 1 oro · 2 plata · 3 bronce
  mes: { type: String, default: '' },
  anio: { type: [Number, String], default: '' }
})

const TONOS = {
  1: { cara: ['#fff3b8', '#f6c94a', '#d99a12', '#a86d05'], borde: ['#ffe58a', '#9a6204'], texto: '#7a4b02' },
  2: { cara: ['#ffffff', '#e3e9ee', '#aab7c3', '#6f7e8c'], borde: ['#f4f7fa', '#5d6b78'], texto: '#3d4a57' },
  3: { cara: ['#ffe2c6', '#eaa56a', '#b8702f', '#7c4413'], borde: ['#f7c8a0', '#6b3810'], texto: '#4f2808' }
}

const tono = computed(() => TONOS[props.lugar] || TONOS[1])
const pie = computed(() => `${props.mes} ${props.anio}`.trim().toUpperCase())

// Los id de los degradados tienen que ser únicos si hay dos medallas en pantalla.
const uid = useId()
const id = (n) => `${n}-${uid}`
</script>

<template>
  <svg class="medalla" viewBox="0 0 320 400" role="img" :aria-label="`Medalla de ${lugar}.º lugar`">
    <defs>
      <radialGradient :id="id('cara')" cx="38%" cy="32%" r="75%">
        <stop offset="0" :stop-color="tono.cara[0]" />
        <stop offset=".35" :stop-color="tono.cara[1]" />
        <stop offset=".75" :stop-color="tono.cara[2]" />
        <stop offset="1" :stop-color="tono.cara[3]" />
      </radialGradient>
      <linearGradient :id="id('borde')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="tono.borde[0]" />
        <stop offset="1" :stop-color="tono.borde[1]" />
      </linearGradient>
      <radialGradient :id="id('centro')" cx="50%" cy="40%" r="70%">
        <stop offset="0" stop-color="#15467f" />
        <stop offset="1" stop-color="#0a2750" />
      </radialGradient>
      <mask :id="id('corredores')" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="400">
        <image :href="corredores" x="108" y="187" width="104" height="142" preserveAspectRatio="xMidYMid meet" />
      </mask>
      <path :id="id('arriba')" d="M 61 258 A 99 99 0 0 1 259 258" />
      <path :id="id('abajo')" d="M 49 258 A 111 111 0 0 0 271 258" />
    </defs>

    <!-- cinta -->
    <path d="M70 0 H142 L186 150 H128 Z" fill="#23964d" />
    <path d="M84 0 H96 L146 150 H134 Z" fill="#ffffff" opacity=".9" />
    <path d="M178 0 H250 L192 150 H134 Z" fill="#1d7fd1" />
    <path d="M224 0 H236 L184 150 H172 Z" fill="#ffffff" opacity=".9" />
    <rect x="118" y="136" width="84" height="26" rx="6" :fill="`url(#${id('borde')})`" />

    <!-- disco -->
    <circle cx="164" cy="266" r="130" fill="#000" opacity=".22" />
    <circle cx="160" cy="258" r="130" :fill="`url(#${id('borde')})`" />
    <circle cx="160" cy="258" r="123" :fill="`url(#${id('cara')})`" />
    <circle cx="160" cy="258" r="88" :fill="`url(#${id('centro')})`" :stroke="tono.cara[3]" stroke-width="3" />

    <g class="medalla__texto" :fill="tono.texto" text-anchor="middle">
      <text><textPath :href="`#${id('arriba')}`" startOffset="50%">RETO ACTIVIDA</textPath></text>
      <text v-if="pie"><textPath :href="`#${id('abajo')}`" startOffset="50%">{{ pie }}</textPath></text>
    </g>
    <text x="44" y="264" font-size="16" :fill="tono.texto" text-anchor="middle">★</text>
    <text x="276" y="264" font-size="16" :fill="tono.texto" text-anchor="middle">★</text>

    <rect x="0" y="0" width="320" height="400" :fill="`url(#${id('cara')})`" :mask="`url(#${id('corredores')})`" />
  </svg>
</template>

<style scoped>
.medalla {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.medalla__texto {
  font-family: inherit;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 3.5px;
}
</style>
