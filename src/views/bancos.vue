<template>
  <v-container fluid>
    <h1 class="text-h5 text-sm-h4 mb-4">🏦 Bancos</h1>

    <!-- Bancos vinculados ao usuário -->
    <v-card class="mb-6">
      <v-card-title class="bg-primary-lighten-5">
        Meus Bancos Vinculados
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="abrirDialogVinculo">
          Vincular Banco
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headersVinculados"
          :items="bancosVinculados"
          :loading="loadingVinculados"
          items-per-page="5"
          class="elevation-0"
        >
          <template v-slot:item.saldo="{ item }">
            R$ {{ formatarMoeda(item.saldo) }}
          </template>
          <template v-slot:item.limite_credito="{ item }">
            R$ {{ formatarMoeda(item.limite_credito) }}
          </template>
          <template v-slot:item.acoes="{ item }">
            <v-btn icon variant="text" size="small" color="primary" @click="editarSaldoLimite(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="error" @click="confirmarDesvincular(item)">
              <v-icon>mdi-link-off</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="info" class="ma-4">Nenhum banco vinculado.</v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Bancos disponíveis no sistema (não vinculados) -->
    <v-card>
      <v-card-title class="bg-grey-lighten-4">
        Bancos disponíveis para vincular
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headersDisponiveis"
          :items="bancosDisponiveis"
          :loading="loadingDisponiveis"
          items-per-page="10"
          class="elevation-0"
        >
          <template v-slot:item.acoes="{ item }">
            <v-btn color="success" size="small" @click="vincularBanco(item)">
              Vincular
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="success" class="ma-4">Todos os bancos já estão vinculados!</v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog para vincular novo banco -->
    <v-dialog v-model="dialogVinculo" max-width="500px">
      <v-card>
        <v-card-title>Vincular banco</v-card-title>
        <v-card-text>
          <v-form ref="formVinculo" v-model="formVinculoValido">
            <v-select
              v-model="novoVinculo.id_banco"
              :items="bancosSistema"
              item-title="nome"
              item-value="id"
              label="Selecione o banco"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="novoVinculo.nome_conta"
              label="Nome da conta (ex: Conta Corrente, Poupança)"
              required
              variant="outlined"
            />
            <v-text-field
              v-model.number="novoVinculo.saldo"
              label="Saldo inicial"
              type="number"
              step="0.01"
              required
              variant="outlined"
              prepend-inner-icon="mdi-cash"
            />
            <v-text-field
              v-model.number="novoVinculo.limite_credito"
              label="Limite de crédito (se cartão)"
              type="number"
              step="0.01"
              variant="outlined"
              prepend-inner-icon="mdi-credit-card"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogVinculo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarVinculo" :disabled="!formVinculoValido">Vincular</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para editar saldo/limite -->
    <v-dialog v-model="dialogEdicao" max-width="400px">
      <v-card>
        <v-card-title>Editar Saldo/Limite</v-card-title>
        <v-card-text>
          <v-text-field
            v-model.number="edicao.saldo"
            label="Saldo atual"
            type="number"
            step="0.01"
            required
            variant="outlined"
          />
          <v-text-field
            v-model.number="edicao.limite_credito"
            label="Limite de crédito"
            type="number"
            step="0.01"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogEdicao = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarEdicao">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { formatarMoeda } from '../utils/formatUtils'

// Tabela de bancos vinculados
const headersVinculados = [
  { title: 'Banco', key: 'banco_nome' },
  { title: 'Conta', key: 'nome_conta' },
  { title: 'Saldo (R$)', key: 'saldo', align: 'end' },
  { title: 'Limite Crédito (R$)', key: 'limite_credito', align: 'end' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'center' }
]

const headersDisponiveis = [
  { title: 'Banco', key: 'nome' },
  { title: 'Código', key: 'codigo' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'center' }
]

// Dados
const bancosVinculados = ref([])
const bancosDisponiveis = ref([])
const bancosSistema = ref([])   // lista completa para o select
const loadingVinculados = ref(false)
const loadingDisponiveis = ref(false)

// Dialog de vínculo
const dialogVinculo = ref(false)
const formVinculoValido = ref(false)
const formVinculo = ref(null)
const novoVinculo = ref({
  id_banco: null,
  nome_conta: '',
  saldo: 0,
  limite_credito: 0
})

// Dialog de edição
const dialogEdicao = ref(false)
const edicao = ref({
  id: null,
  saldo: 0,
  limite_credito: 0
})

// Carregar dados
const carregarBancos = async () => {
  loadingVinculados.value = true
  loadingDisponiveis.value = true
  try {
    // Endpoints:
    // GET /api/bancos-usuario -> bancos vinculados
    // GET /api/bancos-sistema -> todos os bancos (precisa criar)
    const [vinculadosRes, sistemaRes] = await Promise.all([
      api.get('/bancos-usuario'),
      api.get('/bancos-sistema')   // novo endpoint
    ])
    bancosVinculados.value = vinculadosRes.data
    bancosSistema.value = sistemaRes.data

    // Filtrar bancos não vinculados
    const idsVinculados = new Set(bancosVinculados.value.map(b => b.banco_id))
    bancosDisponiveis.value = bancosSistema.value.filter(b => !idsVinculados.has(b.id))
  } catch (error) {
    console.error(error)
  } finally {
    loadingVinculados.value = false
    loadingDisponiveis.value = false
  }
}

const vincularBanco = async (banco) => {
  novoVinculo.value = {
    id_banco: banco.id,
    nome_conta: '',
    saldo: 0,
    limite_credito: 0
  }
  dialogVinculo.value = true
}

const abrirDialogVinculo = () => {
  novoVinculo.value = { id_banco: null, nome_conta: '', saldo: 0, limite_credito: 0 }
  dialogVinculo.value = true
}

const salvarVinculo = async () => {
  if (!formVinculoValido.value) return
  try {
    await api.post('/bancos-usuario', novoVinculo.value)
    await carregarBancos()
    dialogVinculo.value = false
  } catch (error) {
    alert('Erro ao vincular banco')
  }
}

const confirmarDesvincular = async (banco) => {
  if (confirm(`Desvincular ${banco.banco_nome} - ${banco.nome_conta}?`)) {
    try {
      await api.delete(`/bancos-usuario/${banco.id}`)
      await carregarBancos()
    } catch (error) {
      alert('Erro ao desvincular')
    }
  }
}

const editarSaldoLimite = (banco) => {
  edicao.value = {
    id: banco.id,
    saldo: banco.saldo,
    limite_credito: banco.limite_credito
  }
  dialogEdicao.value = true
}

const salvarEdicao = async () => {
  try {
    await api.put(`/bancos-usuario/${edicao.value.id}`, {
      saldo: edicao.value.saldo,
      limite_credito: edicao.value.limite_credito
    })
    await carregarBancos()
    dialogEdicao.value = false
  } catch (error) {
    alert('Erro ao atualizar')
  }
}

onMounted(() => {
  carregarBancos()
})
</script>

<style scoped>
.bg-primary-lighten-5 {
  background-color: #e3f2fd;
}
</style>