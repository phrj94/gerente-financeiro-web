<!-- src/pages/RegisterPage.vue -->
<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="10" md="8" lg="6" xl="4">
                <v-card class="pa-4 pa-sm-6" rounded="lg" elevation="4">
                    <v-card-title class="text-center text-h5 font-weight-bold mb-4">
                        <span class="primary--text">📝 Criar Conta</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="formValido" @submit.prevent="handleCadastro">
                            <v-text-field v-model="nome" label="Nome completo" prepend-inner-icon="mdi-account"
                                :rules="[v => !!v || 'Campo obrigatório']" required variant="outlined"
                                density="comfortable" />

                            <v-text-field v-model="email" label="E-mail" prepend-inner-icon="mdi-email" type="email" :rules="[
                                v => !!v || 'Campo obrigatório',
                                v => /.+@.+\..+/.test(v) || 'E-mail inválido'
                            ]" required variant="outlined" density="comfortable" />

                            <v-text-field v-model="usuario" label="Nome de usuário" prepend-inner-icon="mdi-account-outline"
                                :rules="[v => !!v || 'Campo obrigatório']" required variant="outlined"
                                density="comfortable" />

                            <v-text-field v-model="senha" label="Senha" type="password" prepend-inner-icon="mdi-lock"
                                :rules="[
                                    v => !!v || 'Campo obrigatório',
                                    v => v.length >= 6 || 'Mínimo 6 caracteres'
                                ]" required variant="outlined" density="comfortable" />

                            <v-text-field v-model="confirmarSenha" label="Confirmar senha" type="password"
                                prepend-inner-icon="mdi-lock-check" :rules="[
                                    v => !!v || 'Campo obrigatório',
                                    v => v === senha || 'As senhas não coincidem'
                                ]" required variant="outlined" density="comfortable" />

                            <v-text-field v-model="dataNascimento" label="Data de nascimento" type="date"
                                prepend-inner-icon="mdi-calendar" variant="outlined" density="comfortable" :rules="[
                                    v => !v || new Date(v) < new Date() || 'Data inválida'
                                ]" />

                            <v-btn type="submit" color="success" block size="large" :loading="loading" class="mt-2">
                                Cadastrar
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center">
                        <v-btn variant="text" color="primary" @click="goToLogin">
                            Já tem conta? <strong>Fazer login</strong>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Snackbar para mensagens de feedback -->
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
import api from '@/services/api'

const router = useRouter()

// Dados do formulário
const nome = ref('')
const email = ref('')
const usuario = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const dataNascimento = ref('')
const form = ref(null)
const formValido = ref(false)
const loading = ref(false)

// Snackbar para feedback
const snackbar = ref({
    visible: false,
    message: '',
    color: 'success',
})

// Submete o cadastro
const handleCadastro = async () => {
    if (!formValido.value) return

    loading.value = true
    try {
        await api.post('/auth/registrar', {
            nome: nome.value,
            email: email.value,
            usuario: usuario.value,
            senha: senha.value,
            data_nascimento: dataNascimento.value || null,
        })

        snackbar.value = {
            visible: true,
            message: 'Cadastro realizado com sucesso! Faça login.',
            color: 'success',
        }

        // Redireciona para login após 2 segundos
        setTimeout(() => {
            router.push({ name: 'Login' })
        }, 2000)

    } catch (error) {
        console.error('Erro no cadastro:', error)
        snackbar.value = {
            visible: true,
            message: error.response?.data?.erro || 'Erro ao cadastrar. Tente novamente.',
            color: 'error',
        }
    } finally {
        loading.value = false
    }
}

// Redireciona para login
const goToLogin = () => {
    router.push({ name: 'Login' })
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}
</style>