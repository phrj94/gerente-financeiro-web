import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:3000/api', // sua API backend
  baseURL: import.meta.env.VITE_LOCAL_API_URL, // usa a variável de ambiente para a URL da API
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token nas requisições autenticadas
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para adicionar token nas requisições autenticadas
api.interceptors.response.use(res => {
  // console.log('Resposta')
  return res
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Redirecionar para a página de login se o token for inválido ou expirado
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.href = '/login'
  }
})


export default api