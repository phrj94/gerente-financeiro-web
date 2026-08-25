<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="pa-4 pa-sm-6">
                    <v-card-title class="text-center text-h5 mb-4">
                        Login
                    </v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="login">
                            <v-text-field v-model="usuario" label="Usuário ou Email" prepend-inner-icon="mdi-account"
                                required variant="outlined"></v-text-field>
                            <v-text-field v-model="senha" label="Senha" type="password" prepend-inner-icon="mdi-lock"
                                required variant="outlined"></v-text-field>
                            <v-btn type="submit" color="primary" block size="large" :loading="loading">
                                Entrar
                            </v-btn>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn variant="text" to="/cadastro">Criar conta</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const usuario = ref('')
const senha = ref('')
const loading = ref(false)

const login = async () => {
    loading.value = true
    // console.log(api.defaults.baseURL)
    try {
        const res = await api.post('/auth/entrar', {
            usuario: usuario.value,
            senha: senha.value
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
        router.push('/dashboard')
    } catch (err) {
        alert('Erro no login: ' + (err.response?.data?.erro || 'Credenciais inválidas'))
    } finally {
        loading.value = false
    }
}
</script>