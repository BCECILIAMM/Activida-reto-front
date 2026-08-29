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

/* ------------------------------------------------------------------
   Sesión caducada: cuando una petición autenticada recibe 401, la app
   debe cerrar sesión y avisar. Se registra un solo manejador global
   desde useAuth para no acoplar este módulo a Vue.
------------------------------------------------------------------ */
let onUnauthorized = null

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

async function request(path, { method = 'GET', body, auth = true, on401 = 'logout' } = {}) {
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
    // 401 en una ruta autenticada = el token ya no sirve. Salvo que quien
    // llama pida ignorarlo (p. ej. "cambiar contraseña", donde 401 solo
    // significa "tu contraseña actual está mal").
    if (res.status === 401 && auth && on401 === 'logout') {
      onUnauthorized?.()
    }
    throw new ApiError(data?.message || `Error ${res.status}`, res.status, data)
  }
  return data
}

/**
 * Sube un archivo directo a Cloudflare R2 usando la URL firmada que dio el
 * backend. No lleva token: la firma ya autoriza la subida. No pasa por
 * `request` porque la respuesta de R2 no es JSON.
 */
export async function uploadToSignedUrl(url, file, contentType) {
  let res
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file
    })
  } catch (e) {
    throw new ApiError('No se pudo subir el archivo. Revisa tu conexión.', 0, null)
  }
  if (!res.ok) {
    throw new ApiError(`El almacenamiento rechazó la subida (${res.status}).`, res.status, null)
  }
}

export const api = {
  auth: {
    registro: (payload) => request('/auth/registro', { method: 'POST', body: payload, auth: false }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
    yo: () => request('/auth/yo'),
    cambiarPassword: (payload) =>
      request('/auth/cambiar-password', { method: 'POST', body: payload, on401: 'ignore' })
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
      if (desde != null) params.set('desde', desde)
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

/* ------------------------------------------------------------------
   Formatos y tamaño que acepta el backend para las evidencias.
   Debe coincidir con src/lib/storage.js del backend.
------------------------------------------------------------------ */
export const EVIDENCIA_TIPOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime'
]

export const EVIDENCIA_MAX_BYTES = 25 * 1024 * 1024
