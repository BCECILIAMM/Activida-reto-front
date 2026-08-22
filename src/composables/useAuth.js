import { reactive, computed } from 'vue'
import { api, ApiError, getToken, setToken } from '../services/api.js'

const state = reactive({
  usuario: null,
  inscripcion: null,
  ready: false, // ya se intentó recuperar la sesión guardada
  loading: false
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
  } catch (e) {
    setToken(null)
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
    return data
  } finally {
    state.loading = false
  }
}

async function registro({ nombre, email, password, telefono }) {
  state.loading = true
  try {
    const data = await api.auth.registro({ nombre, email, password, telefono })
    setToken(data.token)
    state.usuario = data.usuario
    state.inscripcion = data.inscripcion
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

export function useAuth() {
  return {
    usuario: computed(() => state.usuario),
    inscripcion: computed(() => state.inscripcion),
    isAuthenticated: computed(() => Boolean(state.usuario)),
    ready: computed(() => state.ready),
    loading: computed(() => state.loading),
    restoreSession,
    login,
    registro,
    logout
  }
}

export { ApiError }
