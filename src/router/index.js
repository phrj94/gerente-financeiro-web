// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importação das páginas (as que você já tem ou vai criar)
import Login from '@/views/Login.vue'
import Cadastro from '@/views/Cadastro.vue'
import Dashboard from '@/views/Dashboard.vue'
import Movimentacoes from '@/views/Movimentacoes.vue'
import Bancos from '@/views/Bancos.vue'
import Responsaveis from '@/views/Responsaveis.vue'
import Rotulos from '@/views/Rotulos.vue'
import Perfil from '@/views/Perfil.vue'
// import PerfisMovimentacao from '@/views/PerfisMovimentacao.vue'

const routes = [
  // Rotas Públicas
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/cadastro', name: 'Cadastro', component: Cadastro, meta: { public: true } },
  
  // Rotas Privadas (requerem autenticação)
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/movimentacoes', name: 'Movimentacoes', component: Movimentacoes, meta: { requiresAuth: true } },
  { path: '/bancos', name: 'Bancos', component: Bancos, meta: { requiresAuth: true } },
  { path: '/responsaveis', name: 'Responsaveis', component: Responsaveis, meta: { requiresAuth: true } },
  { path: '/rotulos', name: 'Rotulos', component: Rotulos, meta: { requiresAuth: true } },
  { path: '/perfil', name: 'Perfil', component: Perfil, meta: { requiresAuth: true } },
  // { path: '/perfis-movimentacao', name: 'PerfisMovimentacao', component: PerfisMovimentacao, meta: { requiresAuth: true } },
  
  // Redirecionamento padrão
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(), routes})

// Guarda de Navegação (Proteção de Rotas)
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redireciona para login se a rota é protegida e usuário não está logado
   return { name: 'Login', query: { redirect: to.fullPath } }
  } else if (to.meta.public && isAuthenticated && to.name === 'Login') {
    // Se o usuário já está logado e tenta acessar a página de login, redireciona para dashboard
    return { name: 'Dashboard' }
  } else {
    // Permite acesso
    return true
  }
})

export default router