<!-- src/pages/DashboardPage.vue -->
<template>
  <div>
    <h1 class="text-h5 text-sm-h4 mb-4">📊 Dashboard</h1>

    <!-- Botão para adicionar nova movimentação -->
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirDialogNovo" rounded="lg">
        Nova Movimentação
      </v-btn>
    </div>

    <!-- Filtros -->
    <FiltrosDashboard v-model:filtros="filtros" :categorias="categorias" :formasPagamento="formasPagamento"
      :responsaveis="responsaveis" :recebedores="recebedores" :bancos="bancos" :rotulos="rotulos"
      @reset="resetarFiltros" />

    <!-- Cards de resumo (reativos aos filtros) -->
    <CardsResumo :movimentacoes="movimentacoesFiltradas" />

    <!-- Tabela de movimentações -->
    <TabelaMovimentacoes :movimentacoes="movimentacoesFiltradas" :loading="loading" @editar="abrirDialogEdicao"
      @deletar="confirmarDelecao" />

    <!-- Dialog de criação/edição -->
    <DialogMovimentacao v-model="dialogAberto" :movimentacao-para-editar="movimentacaoEditando" :categorias="categorias"
      :formas-pagamento="formasPagamento" :responsaveis="responsaveis" :recebedores="recebedores" :bancos="bancos"
      :rotulos="rotulos" @salvo="onSalvo" />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/services/api'
import { dataAtualISO, dataAtrasISO } from '@/utils/dateUtils'
import FiltrosDashboard from '@/components/dashboard/FiltrosDashboard.vue'
import CardsResumo from '@/components/dashboard/CardsResumo.vue'
import TabelaMovimentacoes from '@/components/dashboard/TabelaMovimentacoes.vue'
import DialogMovimentacao from '@/components/dashboard/DialogMovimentacao.vue'

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

// Movimentações filtradas (aplicando filtros avançados no frontend)
const movimentacoesFiltradas = computed(() => {
  let items = movimentacoes.value
  const f = filtros.value

  if (f.descricao) {
    const termo = f.descricao.toLowerCase()
    items = items.filter(m => m.descricao && m.descricao.toLowerCase().includes(termo))
  }
  if (f.categoria) {
    items = items.filter(m => m.categoria_nome === f.categoria)
  }
  if (f.formaPagamento) {
    items = items.filter(m => m.forma_pagamento_nome === f.formaPagamento)
  }
  if (f.responsavel) {
    items = items.filter(m => m.responsavel_nome === f.responsavel)
  }
  if (f.recebedor) {
    items = items.filter(m => m.recebedor_nome === f.recebedor)
  }
  if (f.bancoOrigem) {
    items = items.filter(m => m.banco_origem_nome === f.bancoOrigem)
  }
  if (f.bancoDestino) {
    items = items.filter(m => m.banco_destino_nome === f.bancoDestino)
  }
  if (f.rotulo) {
    items = items.filter(m => m.rotulo_nome === f.rotulo)
  }
  if (f.tipo) {
    items = items.filter(m => m.tipo_operacao === f.tipo)
  }

  return items
})

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
    console.error('Erro ao carregar dados de apoio: ', error)
  }
}

// Buscar movimentações (com filtros de data enviados para a API)
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

// Resetar filtros para o padrão (últimos 30 dias)
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

// ---------- ESTADO DO DIALOG ----------
const dialogAberto = ref(false)
const movimentacaoEditando = ref(null)

// ---------- HANDLERS ----------
const abrirDialogNovo = () => {
  movimentacaoEditando.value = null
  dialogAberto.value = true
}

const abrirDialogEdicao = (mov) => {
  movimentacaoEditando.value = mov
  dialogAberto.value = true
}

const onSalvo = async () => {
  await buscarMovimentacoes()
}

const confirmarDelecao = async (mov) => {
  if (confirm(`Excluir movimentação de ${mov.descricao || 'sem descrição'}?`)) {
    try {
      await api.delete(`/movimentacoes/${mov.id}`)
      await buscarMovimentacoes()
    } catch (error) {
      console.error('Erro ao deletar movimentação:', error)
      alert('Erro ao excluir movimentação. Tente novamente.')
    }
  }
}

// Reação a mudanças nas datas (único filtro que refaz a chamada à API)
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