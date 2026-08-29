import { reactive, computed } from 'vue'
import { api, ApiError, getToken, setToken, setUnauthorizedHandler } from '../services/api.js'

const state = reactive({
  usuario: null,
  inscripcion: null,
  ready: false, // ya se intentó recuperar la sesión guardada
  loading: false,
  sessionExpired: false, // el token dejó de servir mientras se usaba la app
  restoreFailed: false // no se pudo validar la sesión (p. ej. sin conexión)
})

/* Cuando cualquier petición autenticada recibe 401, se cierra la sesión y se
   marca para que la app muestre el aviso. */
setUnauthorizedHandler(() => {
  if (!state.usuario && !getToken()) return
  setToken(null)
  state.usuario = null
  state.inscripcion = null
  state.sessionExpired = true
})

async function restoreSession() {
  if (!getToken()) {
    state.ready = true
    return
  }
  try {
    const data = await api.auth.yo()
    state.usuario = data.usuario
    state.inscripcion = data.inscripcion
    state.restoreFailed = false
  } catch (e) {
    // Solo se descarta el token si el servidor dice explícitamente que no vale.
    // Un fallo de red no debe cerrar una sesión que quizá siga siendo válida.
    if (e instanceof ApiError && e.status === 401) {
      setToken(null)
      state.usuario = null
      state.inscripcion = null
    } else {
      state.restoreFailed = true
    }
  } finally {
    state.ready = true
  }
}

async function login(email, password) {
  state.loading = true
  try {
    const data = await api.auth.login({ email, password })
    setToken(data.token)
    state.usuario = data.usuario
    state.inscripcion = data.inscripcion
    state.sessionExpired = false
    return data
  } finally {
    state.loading = false
  }
}

async function registro({ nombre, email, password, telefono }) {
  state.loading = true
  try {
    const data = await api.auth.registro({ nombre, email, password, telefono: telefono || undefined })
    setToken(data.token)
    state.usuario = data.usuario
    state.inscripcion = data.inscripcion
    state.sessionExpired = false
    return data
  } finally {
    state.loading = false
  }
}

function logout() {
  setToken(null)
  state.usuario = null
  state.inscripcion = null
}

function acknowledgeExpired() {
  state.sessionExpired = false
}

export function useAuth() {
  return {
    usuario: computed(() => state.usuario),
    inscripcion: computed(() => state.inscripcion),
    isAuthenticated: computed(() => Boolean(state.usuario)),
    ready: computed(() => state.ready),
    loading: computed(() => state.loading),
    sessionExpired: computed(() => state.sessionExpired),
    restoreFailed: computed(() => state.restoreFailed),
    restoreSession,
    login,
    registro,
    logout,
    acknowledgeExpired
  }
}

export { ApiError }
