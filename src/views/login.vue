<!-- src/pages/LoginPage.vue -->
<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="pa-4 pa-sm-6" rounded="lg" elevation="4">
                    <v-card-title class="text-center text-h5 font-weight-bold mb-4">
                        <span class="primary--text">💰 Gerente Financeiro</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="formValido" @submit.prevent="handleLogin">
                            <v-text-field v-model="usuario" label="Usuário ou E-mail" prepend-inner-icon="mdi-account"
                                :rules="[v => !!v || 'Campo obrigatório']" required variant="outlined"
                                density="comfortable" />

                            <v-text-field v-model="senha" label="Senha" type="password" prepend-inner-icon="mdi-lock"
                                :rules="[v => !!v || 'Campo obrigatório']" required variant="outlined" density="comfortable"
                                @keyup.enter="handleLogin" />

                            <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2">
                                Entrar
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center">
                        <v-btn variant="text" color="primary" @click="goToCadastro">
                            Não tem conta? <strong>Cadastre-se</strong>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Snackbar para mensagens de erro -->
        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="5000">
            {{ snackbar.message }}
            <template v-slot:actions>
                <v-btn variant="text" icon="mdi-close" @click="snackbar.visible = false" />
            </template>
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Dados do formulário
const usuario = ref('')
const senha = ref('')
const form = ref(null)
const formValido = ref(false)
const loading = ref(false)

// Snackbar para feedback
const snackbar = ref({
    visible: false,
    message: '',
    color: 'error',
})

// Submete o login
const handleLogin = async () => {
    if (!formValido.value) return

    loading.value = true
    try {
        const result = await authStore.login(usuario.value, senha.value)
        if (result.success) {
            router.push('/')
        } else {
            snackbar.value = {
                visible: true,
                message: result.error || 'Erro ao fazer login. Verifique suas credenciais.',
                color: 'error',
            }
        }
    } catch (error) {
        console.error('Erro no login:', error)
        snackbar.value = {
            visible: true,
            message: 'Erro interno. Tente novamente mais tarde.',
            color: 'error',
        }
    } finally {
        loading.value = false
    }
}

// Redireciona para cadastro
const goToCadastro = () => {
    router.push({ name: 'Cadastro' })
}
</script>

<style scoped>
/* Ajustes para centralização vertical */
.fill-height {
    min-height: 100vh;
}
</style>