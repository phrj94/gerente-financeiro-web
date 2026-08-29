import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  // baseURL: 'http://localhost:3000/api', // sua API backend
  baseURL: import.meta.env.VITE_LOCAL_API_URL, // usa a variável de ambiente para a URL da API
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
})

// Interceptador de Requisição – Adiciona Token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptador de Resposta – Trata Erros Globais
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Caso 401 (Não autorizado) – token expirado ou inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      // Aqui você pode implementar refresh token
      // Por enquanto, apenas desloga e redireciona para login
      authStore.logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Outros erros (ex: 500, 422, etc.)
    const errorMessage = error.response?.data?.erro || error.message || 'Erro na comunicação com o servidor'
    return Promise.reject({ ...error, message: errorMessage })
  }
)


export default api