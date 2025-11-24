import axios from 'axios'
import { useAuthStore } from '../store/authStore'

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

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token

    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient


