<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import { useTheme } from '../composables/useTheme.js'

const { theme, toggle } = useTheme()

const isDark = computed(() => theme.value === 'dark')
const label = computed(() => (isDark.value ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'))
</script>

<template>
  <Button
    class="theme-toggle"
    rounded
    text
    :aria-label="label"
    v-tooltip.bottom="label"
    @click="toggle"
  >
    <span class="theme-toggle__icon" :class="{ 'is-dark': isDark }">
      <i class="pi pi-sun" />
      <i class="pi pi-moon" />
    </span>
  </Button>
</template>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  padding: 0 !important;
  background: var(--act-panel) !important;
  border: 1px solid var(--act-border) !important;
  color: var(--act-text) !important;
  box-shadow: var(--act-shadow);
}

.theme-toggle:hover {
  border-color: var(--act-green) !important;
  color: var(--act-green) !important;
}

.theme-toggle__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
}

.theme-toggle__icon i {
  position: absolute;
  font-size: 1rem;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s;
}

/* En claro se ve la luna (invitando a oscurecer); en oscuro, el sol. */
.theme-toggle__icon .pi-sun {
  opacity: 0;
  transform: rotate(-90deg) scale(0.4);
}
.theme-toggle__icon .pi-moon {
  opacity: 1;
  transform: rotate(0) scale(1);
}

.theme-toggle__icon.is-dark .pi-sun {
  opacity: 1;
  transform: rotate(0) scale(1);
}
.theme-toggle__icon.is-dark .pi-moon {
  opacity: 0;
  transform: rotate(90deg) scale(0.4);
}
</style>
