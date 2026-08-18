import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Cuenta regresiva hasta una fecha ISO.
 * Devuelve días / horas / minutos y el porcentaje de mes transcurrido.
 */
export function useCountdown(startsAt, endsAt) {
  const now = ref(new Date())
  let timer = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 30000)
  })

  onUnmounted(() => clearInterval(timer))

  const start = new Date(startsAt)
  const end = new Date(endsAt)

  const remaining = computed(() => Math.max(0, end - now.value))

  const parts = computed(() => {
    const ms = remaining.value
    return {
      days: Math.floor(ms / 86400000),
      hours: String(Math.floor((ms % 86400000) / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
    }
  })

  const notStarted = computed(() => now.value < start)
  const finished = computed(() => remaining.value === 0)

  const monthProgress = computed(() => {
    const total = end - start
    const done = now.value - start
    return Math.max(0, Math.min(1, done / total))
  })

  return { parts, remaining, notStarted, finished, monthProgress, now }
}
