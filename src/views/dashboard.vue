<!-- src/pages/DashboardPage.vue -->
<template>
  <div>
    <h1 class="text-h5 text-sm-h4 mb-4">📊 Dashboard</h1>

    <!-- Filtros -->
    <FiltrosDashboard v-model:filtros="filtros" :categorias="categorias" :formasPagamento="formasPagamento"
      :responsaveis="responsaveis" :recebedores="recebedores" :bancos="bancos" :rotulos="rotulos"
      @reset="resetarFiltros" />

    <!-- Cards de resumo (em breve) -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card color="green-lighten-5" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-subtitle1 font-weight-medium text-green-darken-2">💰 Entradas</div>
            <div class="text-h5 text-green-darken-2">R$ 0,00</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="red-lighten-5" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-subtitle1 font-weight-medium text-red-darken-2">💸 Saídas</div>
            <div class="text-h5 text-red-darken-2">R$ 0,00</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="grey-lighten-3" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-subtitle1 font-weight-medium">⚖️ Saldo</div>
            <div class="text-h5">R$ 0,00</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabela de movimentações (em breve) -->
    <v-card>
      <v-card-title>📋 Movimentações</v-card-title>
      <v-data-table :headers="headers" :items="movimentacoes" :loading="loading" items-per-page="-1" hide-default-footer
        class="elevation-0">
        <template v-slot:no-data>
          <v-alert type="info" class="ma-4">
            Nenhuma movimentação encontrada.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'
import { dataAtualISO, dataAtrasISO } from '@/utils/dateUtils'
import FiltrosDashboard from '@/components/dashboard/FiltrosDashboard.vue'

// Filtros
const filtros = ref({
  dataInicio: dataAtrasISO(30),
  dataFim: dataAtualISO(),
  dataRegistroInicio: '',
  dataRegistroFim: '',
  descricao: '',
  categoria: null,
  formaPagamento: null,
  responsavel: null,
  recebedor: null,
  bancoOrigem: null,
  bancoDestino: null,
  rotulo: null,
  tipo: null,
})

// Dados de apoio
const categorias = ref([])
const formasPagamento = ref([])
const responsaveis = ref([])
const recebedores = ref([])
const bancos = ref([])
const rotulos = ref([])

// Movimentações
const movimentacoes = ref([])
const loading = ref(false)

// Headers da tabela
const headers = [
  { title: 'Data', key: 'data_movimentacao', sortable: true },
  { title: 'Descrição', key: 'descricao' },
  { title: 'Categoria', key: 'categoria_nome' },
  { title: 'Forma Pagamento', key: 'forma_pagamento_nome' },
  { title: 'Responsável', key: 'responsavel_nome' },
  { title: 'Recebedor', key: 'recebedor_nome' },
  { title: 'Valor', key: 'valor', align: 'end' },
]

// Carregar dados de apoio
const carregarDadosApoio = async () => {
  try {
    const [cat, fp, resp, banc, rot] = await Promise.all([
      api.get('/apoio/categorias'),
      api.get('/apoio/formas-pagamento'),
      api.get('/apoio/responsaveis'),
      api.get('/apoio/bancos'),
      api.get('/apoio/rotulos'),
    ])
    categorias.value = cat.data.data || cat.data
    formasPagamento.value = fp.data.data || fp.data
    responsaveis.value = resp.data.data || resp.data
    recebedores.value = resp.data.data || resp.data
    bancos.value = banc.data.data || banc.data
    rotulos.value = rot.data.data || rot.data
  } catch (error) {
    console.error('Erro ao carregar dados de apoio:', error)
  }
}

// Buscar movimentações
const buscarMovimentacoes = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.value.dataInicio) params.append('dataInicio', filtros.value.dataInicio)
    if (filtros.value.dataFim) params.append('dataFim', filtros.value.dataFim)
    if (filtros.value.dataRegistroInicio) params.append('dataRegistroInicio', filtros.value.dataRegistroInicio)
    if (filtros.value.dataRegistroFim) params.append('dataRegistroFim', filtros.value.dataRegistroFim)

    const url = `/movimentacoes${params.toString() ? `?${params.toString()}` : ''}`
    const response = await api.get(url)
    movimentacoes.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
  } finally {
    loading.value = false
  }
}

// Resetar filtros
const resetarFiltros = () => {
  filtros.value = {
    dataInicio: dataAtrasISO(30),
    dataFim: dataAtualISO(),
    dataRegistroInicio: '',
    dataRegistroFim: '',
    descricao: '',
    categoria: null,
    formaPagamento: null,
    responsavel: null,
    recebedor: null,
    bancoOrigem: null,
    bancoDestino: null,
    rotulo: null,
    tipo: null,
  }
}

// Reação a mudanças nos filtros (apenas data)
watch(
  () => [filtros.value.dataInicio, filtros.value.dataFim, filtros.value.dataRegistroInicio, filtros.value.dataRegistroFim],
  () => {
    buscarMovimentacoes()
  }
)

onMounted(() => {
  carregarDadosApoio()
  buscarMovimentacoes()
})
</script>