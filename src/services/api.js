const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const TOKEN_KEY = 'activida:token'

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0, null)
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(data?.message || `Error ${res.status}`, res.status, data)
  }
  return data
}

export const api = {
  auth: {
    registro: (payload) => request('/auth/registro', { method: 'POST', body: payload, auth: false }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
    yo: () => request('/auth/yo'),
    cambiarPassword: (payload) => request('/auth/cambiar-password', { method: 'POST', body: payload })
  },
  retos: {
    activo: () => request('/retos/activo', { auth: false }),
    miProgreso: () => request('/retos/mi-progreso'),
    ranking: (limite) => request(`/retos/ranking${limite ? `?limite=${limite}` : ''}`)
  },
  actividades: {
    registrar: (payload) => request('/actividades', { method: 'POST', body: payload }),
    historial: ({ limite, desde } = {}) => {
      const params = new URLSearchParams()
      if (limite) params.set('limite', limite)
      if (desde) params.set('desde', desde)
      const qs = params.toString()
      return request(`/actividades${qs ? `?${qs}` : ''}`)
    },
    borrar: (id) => request(`/actividades/${id}`, { method: 'DELETE' }),
    reiniciar: () => request('/actividades', { method: 'DELETE' }),
    sincronizar: (payload) => request('/actividades/sincronizar', { method: 'POST', body: payload })
  },
  evidencias: {
    urlDeSubida: (payload) => request('/evidencias/url-de-subida', { method: 'POST', body: payload }),
    confirmar: (id) => request(`/evidencias/${id}/confirmar`, { method: 'POST' }),
    listar: (actividadId) => request(`/evidencias/actividad/${actividadId}`),
    borrar: (id) => request(`/evidencias/${id}`, { method: 'DELETE' })
  }
}
