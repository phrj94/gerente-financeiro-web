<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="5" xl="4">
                <v-card class="pa-4 pa-sm-6">
                    <v-card-title class="text-center text-h5 mb-4">
                        Criar Conta
                    </v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="registrar">
                            <v-text-field v-model="nome" label="Nome completo" prepend-inner-icon="mdi-account" required
                                variant="outlined" :rules="[v => !!v || 'Nome é obrigatório']" />

                            <v-text-field v-model="email" label="E-mail" prepend-inner-icon="mdi-email" type="email"
                                required variant="outlined"
                                :rules="[v => !!v || 'E-mail é obrigatório', v => /.+@.+\..+/.test(v) || 'E-mail inválido']" />

                            <v-text-field v-model="usuario" label="Nome de usuário" prepend-inner-icon="mdi-account-outline"
                                required variant="outlined" :rules="[v => !!v || 'Usuário é obrigatório']" />

                            <v-text-field v-model="senha" label="Senha" type="password" prepend-inner-icon="mdi-lock"
                                required variant="outlined"
                                :rules="[v => !!v || 'Senha é obrigatória', v => v.length >= 6 || 'Mínimo 6 caracteres']" />

                            <v-text-field v-model="dataNascimento" label="Data de nascimento" type="date"
                                prepend-inner-icon="mdi-calendar" variant="outlined" />

                            <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2">
                                Cadastrar
                            </v-btn>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn variant="text" to="/login">Já tenho conta → Entrar</v-btn>
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
const nome = ref('')
const email = ref('')
const usuario = ref('')
const senha = ref('')
const dataNascimento = ref('')
const loading = ref(false)

const registrar = async () => {
    loading.value = true
    try {
        await api.post('/auth/registrar', {
            nome: nome.value,
            email: email.value,
            usuario: usuario.value,
            senha: senha.value,
            data_nascimento: dataNascimento.value || null
        })
        alert('Cadastro realizado com sucesso! Faça login.')
        router.push('/login')
    } catch (error) {
        const msg = error.response?.data?.erro || 'Erro ao cadastrar'
        alert(msg)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}
</style>