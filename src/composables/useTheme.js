import { ref, watch } from 'vue'

const STORAGE_KEY = 'activida:theme'
const DARK_CLASS = 'activida-dark'

/**
 * Detecta la preferencia inicial:
 * 1. Lo que la usuaria eligió antes (localStorage)
 * 2. La preferencia del sistema operativo
 */
function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch (e) {
    /* modo privado / storage bloqueado */
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Estado compartido entre todos los componentes (singleton)
const theme = ref(detectInitial())

function apply(value) {
  const root = document.documentElement
  root.classList.toggle(DARK_CLASS, value === 'dark')
  root.style.colorScheme = value
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', value === 'dark' ? '#080c09' : '#2ee56f')
}

apply(theme.value)

watch(theme, (value) => {
  apply(value)
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch (e) {
    /* noop */
  }
})

export function useTheme() {
  const isDark = () => theme.value === 'dark'
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  const set = (value) => {
    theme.value = value
  }
  return { theme, isDark, toggle, set }
}
