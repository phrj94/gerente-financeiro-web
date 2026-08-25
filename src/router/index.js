import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Dashboard from '../views/dashboard.vue'
import Bancos from '../views/bancos.vue'
import Responsaveis from '../views/responsaveis.vue'
import Rotulos from '../views/rotulos.vue'
import Perfil from '../views/perfil.vue'
import Movimentacoes from '../views/movimentacoes.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/cadastro', name: 'Cadastro', component: Cadastro },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/bancos', name: 'Bancos', component: Bancos, meta: { requiresAuth: true } },
    { path: '/responsaveis', name: 'Responsaveis', component: Responsaveis, meta: { requiresAuth: true } },
    { path: '/rotulos', name: 'Rotulos', component: Rotulos, meta: { requiresAuth: true } },
    { path: '/movimentacoes', name: 'Movimentacoes', component: Movimentacoes, meta: { requiresAuth: true } },
    { path: '/perfil', name: 'Perfil', component: Perfil, meta: { requiresAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        return { name: 'Login' }
    }
    // [FUTURO] Checar se o token é válido, se não for, redirecionar para login e limpar o localStorage
    return true;
})

export default router