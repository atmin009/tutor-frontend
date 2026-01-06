import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const STORAGE_KEY = 'tutor-front-auth'

// Use relative URL when in browser, or environment variable if set
const getBaseURL = () => {
  // In production, you can set VITE_API_BASE_URL in .env
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  // Use relative URL which will be proxied by Vite dev server
  return '/api'
}

export const apiClient = axios.create({
  baseURL: getBaseURL(),
})

const getTokenFallbackFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    return typeof state?.token === 'string' ? state.token : null
  } catch {
    return null
  }
}

apiClient.interceptors.request.use(
  (config) => {
    // Prefer in-memory store token; fallback to storage to avoid hydration race (esp. on first load).
    const token = useAuthStore.getState().token ?? getTokenFallbackFromStorage()

    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token missing/expired/invalid → force logout so ProtectedRoute redirects to login.
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

export default apiClient


