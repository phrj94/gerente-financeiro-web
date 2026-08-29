// src/stores/auth.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
        loading: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUsuario: (state) => state.usuario,
    },
    actions: {
        async login(usuario, senha) {
            this.loading = true
            try {
                const response = await api.post('/auth/entrar', { usuario, senha })
                const { token, usuario: userData } = response.data.data
                this.token = token
                this.usuario = userData
                localStorage.setItem('token', token)
                localStorage.setItem('usuario', JSON.stringify(userData))
                return { success: true }
            } catch (error) {
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async logout() {
            try {
                await api.post('/auth/sair')
            } catch (error) {
                console.warn('Erro ao fazer logout no servidor:', error)
            } finally {
                this.token = null
                this.usuario = null
                localStorage.removeItem('token')
                localStorage.removeItem('usuario')
                window.location.href = '/login'
            }
        },

        // Atualiza dados do usuário após edição de perfil
        updateUsuario(userData) {
            this.usuario = { ...this.usuario, ...userData }
            localStorage.setItem('usuario', JSON.stringify(this.usuario))
        },
    },
})