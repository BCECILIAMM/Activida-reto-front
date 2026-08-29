import { ref, computed, onMounted, onUnmounted, toValue } from 'vue'

/**
 * Cuenta regresiva hasta una fecha.
 * `startsAt` y `endsAt` pueden ser un string, un ref o un getter: así la cuenta
 * se ajusta sola cuando el reto se carga desde el backend después del montaje.
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

  const start = computed(() => new Date(toValue(startsAt)))
  const end = computed(() => new Date(toValue(endsAt)))

  const remaining = computed(() => Math.max(0, end.value - now.value))

  const parts = computed(() => {
    const ms = remaining.value
    return {
      days: Math.floor(ms / 86400000),
      hours: String(Math.floor((ms % 86400000) / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
    }
  })

  const notStarted = computed(() => now.value < start.value)
  const finished = computed(() => {
    const e = end.value
    return e instanceof Date && !isNaN(e) && now.value >= e
  })

  const monthProgress = computed(() => {
    const total = end.value - start.value
    const done = now.value - start.value
    if (!total || isNaN(total)) return 0
    return Math.max(0, Math.min(1, done / total))
  })

  return { parts, remaining, notStarted, finished, monthProgress, now }
}
