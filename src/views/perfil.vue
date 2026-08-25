<template>
  <v-container fluid>
    <h1 class="text-h5 text-sm-h4 mb-4">👤 Meu Perfil</h1>

    <v-row>
      <!-- Coluna principal: Dados Pessoais -->
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title class="bg-primary-lighten-5">
            Dados Pessoais
          </v-card-title>
          <v-card-text class="pa-4 pa-sm-6">
            <v-form ref="formPerfil" v-model="formValido">
              <v-text-field v-model="usuario.nome" label="Nome completo" readonly variant="outlined"
                density="comfortable" />
              <v-text-field v-model="usuario.email" label="E-mail" readonly variant="outlined" density="comfortable" />
              <v-text-field v-model="usuario.usuario" label="Nome de usuário" readonly variant="outlined"
                density="comfortable" />

              <v-divider class="my-4" />

              <v-text-field v-model.number="patrimonio" label="Patrimônio total (R$)" type="number" step="0.01" min="0"
                required variant="outlined" density="comfortable" prepend-inner-icon="mdi-cash" :rules="[v => v !== undefined && v !== null || 'Patrimônio é obrigatório',
                v => v >= 0 || 'Valor deve ser positivo']" />
              <v-text-field v-model="dataNascimento" label="Data de nascimento" type="date" variant="outlined"
                density="comfortable" prepend-inner-icon="mdi-calendar"
                :rules="[v => !v || new Date(v) <= new Date() || 'Data não pode ser futura']" />

              <v-btn color="primary" size="large" block class="mt-4" :loading="loadingSalvar" @click="salvarPerfil"
                :disabled="!formValido || !houveAlteracao">
                Salvar alterações
              </v-btn>

              <v-alert v-if="mensagem" :type="tipoMensagem" variant="tonal" class="mt-4" closable
                @click:close="mensagem = ''">
                {{ mensagem }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Coluna: Resumo Financeiro -->
      <v-col cols="12" md="4" lg="6">
        <v-card>
          <v-card-title class="bg-green-lighten-5">
            📊 Resumo Financeiro
          </v-card-title>
          <v-card-text class="pa-4 pa-sm-6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-cash</v-icon>
                </template>
                <v-list-item-title>Patrimônio Total</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-green-darken-2">
                  {{ formatarMoeda(resumoFinanceiro.patrimonio) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-bank</v-icon>
                </template>
                <v-list-item-title>Saldo Bancário Total</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-blue-darken-2">
                  {{ formatarMoeda(resumoFinanceiro.saldo_bancario_total) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-credit-card</v-icon>
                </template>
                <v-list-item-title>Limite de Crédito Total</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-orange-darken-2">
                  {{ formatarMoeda(resumoFinanceiro.limite_credito_total) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Limite Disponível Total</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-green-darken-2">
                  {{ formatarMoeda(resumoFinanceiro.limite_disponivel_total) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { formatarMoeda } from '../utils/formatUtils'

// Dados do usuário logado (vindo do localStorage)
const usuario = ref(JSON.parse(localStorage.getItem('usuario') || '{}'))
const patrimonio = ref(usuario.value.patrimonio || 0)
const dataNascimento = ref(usuario.value.data_nascimento?.slice(0, 10) || '')

const loadingSalvar = ref(false)
const formValido = ref(false)
const formPerfil = ref(null)

const mensagem = ref('')
const tipoMensagem = ref('success')

// Resumo financeiro (dados do endpoint)
const resumoFinanceiro = ref({
  patrimonio: 0,
  saldo_bancario_total: 0,
  limite_credito_total: 0,
  limite_disponivel_total: 0
})

// Computed para verificar se houve alteração
const houveAlteracao = computed(() => {
  return patrimonio.value !== (usuario.value.patrimonio || 0) ||
    dataNascimento.value !== (usuario.value.data_nascimento?.slice(0, 10) || '')
})

// Carregar resumo financeiro do backend
const carregarResumoFinanceiro = async () => {
  try {
    const response = await api.get('/usuarios/resumo-financeiro')
    resumoFinanceiro.value = response.data
  } catch (error) {
    console.error('Erro ao carregar resumo financeiro:', error)
  }
}

// Salvar perfil (patrimônio e data de nascimento)
const salvarPerfil = async () => {
  if (!formValido.value) return
  loadingSalvar.value = true
  mensagem.value = ''
  try {
    const payload = {
      patrimonio: patrimonio.value,
      data_nascimento: dataNascimento.value || null
    }
    const res = await api.put(`/usuarios/${usuario.value.id}`, payload)

    // Atualizar dados no localStorage
    const usuarioAtualizado = { ...usuario.value, ...res.data }
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado))
    usuario.value = usuarioAtualizado

    mensagem.value = 'Perfil atualizado com sucesso!'
    tipoMensagem.value = 'success'
    // Recarregar resumo financeiro
    await carregarResumoFinanceiro()
  } catch (error) {
    console.error(error)
    mensagem.value = error.response?.data?.erro || 'Erro ao atualizar perfil'
    tipoMensagem.value = 'error'
  } finally {
    loadingSalvar.value = false
  }
}

onMounted(() => {
  carregarResumoFinanceiro()
})
</script>

<style scoped>
.bg-primary-lighten-5 {
  background-color: #e3f2fd;
}

.bg-green-lighten-5 {
  background-color: #e8f5e9;
}
</style>