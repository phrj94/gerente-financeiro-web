<template>
  <div>
    <v-container fluid>
      <!-- Título -->
      <h1 class="text-h5 text-sm-h4 mb-4">📊 Dashboard</h1>

      <!-- Componente de Filtros -->
      <FiltrosDashboard
        v-model:filtros="filtros"
        :categorias="categorias"
        :formasPagamento="formasPagamento"
        :responsaveis="responsaveis"
        :recebedores="recebedores"
        :bancos="bancos"
        :rotulos="rotulos"
        :tiposMovimentacao="tiposMovimentacao"
        @reset="resetarFiltros"
      />

      <!-- Componente de Resumo por Banco -->
      <ResumoBancos
        :movimentacoes="movimentacoesFiltradas"
        :bancos="bancos"
      />

      <!-- Componente Gráfico + Resumo -->
        <GraficoResumo
        v-model="campoAgrupamento"
        :movimentacoes="movimentacoesFiltradas"
        :opcoesAgrupamento="opcoesAgrupamento"
        />

      <!-- Componente Tabela de Movimentações -->
      <TabelaMovimentacoes
        :movimentacoes="movimentacoesFiltradas"
        :loading="loading"
        @editar="editarMovimentacao"
        @deletar="confirmarDelete"
      />
    </v-container>

    <!-- Dialog de formulário de movimentação (mantido igual) -->
    <v-dialog v-model="dialogMovimentacao" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ editandoId ? 'Editar' : 'Nova' }} Movimentação</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="formMov" v-model="formValido">
                        <v-row>
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_categoria" :items="categorias" item-title="nome"
                                    item-value="id" label="Categoria" required variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_pagamento" :items="formasPagamento" item-title="nome"
                                    item-value="id" label="Forma de pagamento" required variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field v-model.number="formMovimentacao.valor" label="Valor (R$)" type="number"
                                    step="0.01" required variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formMovimentacao.data_movimentacao" label="Data" type="date" required
                                    variant="outlined" />
                            </v-col>
                            
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_responsavel" :items="responsaveis" item-title="nome"
                                    item-value="id" label="Responsável" variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_recebedor" :items="recebedores" item-title="nome"
                                    item-value="id" label="Recebedor" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_banco" :items="bancos" label="Banco origem" item-value="id" item-title="nome"
                                    variant="outlined"/>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_banco_recebedor" :items="bancos" label="Banco destino" item-value="id" item-title="nome"
                                    variant="outlined"/>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select v-model="formMovimentacao.id_rotulo" :items="rotulos" label="Rótulo" item-value="id" item-title="nome"
                                    variant="outlined"/>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field v-model="formMovimentacao.descricao" label="Descrição" variant="outlined" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="dialogMovimentacao = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="salvarMovimentacao" :disabled="!formValido">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '../services/api'
import { dataAtualISO, dataAtrasISO } from '../utils/dateUtils'
// import { formatarMoeda } from '../utils/formatUtils'

// Componentes importados
import FiltrosDashboard from '../components/FiltrosDashboard.vue'
import ResumoBancos from '../components/ResumoBancos.vue'
import GraficoResumo from '../components/GraficoResumo.vue'
import TabelaMovimentacoes from '../components/TabelaMovimentacoes.vue'

// ---------- DADOS ----------
const movimentacoes = ref([])
const loading = ref(false)

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
  tipo: null
})

// ---------- DADOS DE APOIO ----------
const categorias = ref([])
const formasPagamento = ref([])
const responsaveis = ref([])
const recebedores = ref([])
const bancos = ref([])
const bancosVinculados = ref([])
const rotulos = ref([])

const tiposMovimentacao = [
  { nome: 'Entrada', tipo: 'ENTRADA' },
  { nome: 'Saída', tipo: 'SAIDA' },
  { nome: 'Transferência', tipo: 'TRANSFERENCIA' }
]

// ---------- MOVIMENTAÇÕES FILTRADAS ----------
const movimentacoesFiltradas = computed(() => {
  let items = movimentacoes.value
  const f = filtros.value

  if (f.descricao) {
    const termo = f.descricao.toLowerCase()
    items = items.filter(item => item.descricao && item.descricao.toLowerCase().includes(termo))
  }
  if (f.categoria) {
    items = items.filter(item => item.categoria_nome === f.categoria)
  }
  if (f.formaPagamento) {
    items = items.filter(item => item.forma_pagamento_nome === f.formaPagamento)
  }
  if (f.responsavel) {
    items = items.filter(item => item.responsavel_nome === f.responsavel)
  }
  if (f.recebedor) {
    items = items.filter(item => item.recebedor_nome === f.recebedor)
  }
  if (f.bancoOrigem) {
    items = items.filter(item => item.banco_origem_nome === f.bancoOrigem)
  }
  if (f.bancoDestino) {
    items = items.filter(item => item.banco_destino_nome === f.bancoDestino)
  }
  if (f.rotulo) {
    items = items.filter(item => item.rotulo_nome === f.rotulo)
  }
  if (f.tipo) {
    items = items.filter(item => item.tipo_operacao === f.tipo)
  }

  return items
})

// ---------- RESUMO GERAL (SOMA DE TODOS OS BANCOS) ----------
const resumoGeral = computed(() => {
  let total_entradas = 0
  let total_saidas = 0

  // Usamos os dados do resumo por banco, mas se quiser calcular diretamente:
  const items = movimentacoesFiltradas.value
  for (const item of items) {
    const valor = parseFloat(item.valor) || 0
    if (item.tipo_operacao === 'ENTRADA') total_entradas += valor
    else if (item.tipo_operacao === 'SAIDA') total_saidas += valor
  }
  return {
    total_entradas,
    total_saidas,
    saldo: total_entradas - total_saidas
  }
})

const opcoesAgrupamento = [
  { value: 'categoria_nome', text: 'Categoria' },
  { value: 'responsavel_nome', text: 'Responsável' },
  { value: 'recebedor_nome', text: 'Recebedor' },
  { value: 'rotulo_nome', text: 'Rótulo' },
  { value: 'banco_origem_nome', text: 'Banco Origem' },
  { value: 'banco_destino_nome', text: 'Banco Destino' },
  { value: 'forma_pagamento_nome', text: 'Forma de Pagamento' },
]
const campoAgrupamento = ref('categoria_nome')

// ---------- CRUD DE MOVIMENTAÇÃO ----------
const dialogMovimentacao = ref(false)
const formMov = ref(null)
const formValido = ref(false)
const editandoId = ref(null)
const formMovimentacao = ref({
  id_categoria: null,
  id_pagamento: null,
  valor: null,
  data_movimentacao: '',
  descricao: '',
  id_responsavel: null,
  id_recebedor: null,
  id_banco: null,
  id_rotulo: null,
  id_banco_recebedor: null
})

const formatarData = (data) => {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}

const buscarMovimentacoes = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.value.dataInicio) params.append('dataInicio', filtros.value.dataInicio)
    if (filtros.value.dataFim) params.append('dataFim', filtros.value.dataFim)
    if (filtros.value.dataRegistroInicio) params.append('dataRegistroInicio', filtros.value.dataRegistroInicio)
    if (filtros.value.dataRegistroFim) params.append('dataRegistroFim', filtros.value.dataRegistroFim)

    const url = `/movimentacoes/${params.toString() ? `?${params.toString()}` : ''}`
    const resMov = await api.get(url)
    movimentacoes.value = resMov.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

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
    tipo: null
  }
}

watch(filtros, () => {
  buscarMovimentacoes()
}, { deep: true })

// ---------- CRUD (editar, deletar, salvar) ----------
const abrirDialogMovimentacao = () => {
  editandoId.value = null
  formMovimentacao.value = {
    id_categoria: null,
    id_pagamento: null,
    valor: null,
    data_movimentacao: new Date().toISOString().slice(0, 10),
    descricao: '',
    id_responsavel: null,
    id_recebedor: null,
    id_banco: null,
    id_rotulo: null,
    id_banco_recebedor: null
  }
  dialogMovimentacao.value = true
}

const editarMovimentacao = (mov) => {
  editandoId.value = mov.id
  formMovimentacao.value = {
    id_categoria: mov.id_categoria,
    id_pagamento: mov.id_pagamento,
    valor: mov.valor,
    data_movimentacao: mov.data_movimentacao?.slice(0, 10),
    descricao: mov.descricao || '',
    id_responsavel: mov.id_responsavel,
    id_recebedor: mov.id_recebedor,
    id_banco: mov.id_banco,
    id_rotulo: mov.id_rotulo,
    id_banco_recebedor: mov.id_banco_recebedor
  }
  dialogMovimentacao.value = true
}

const salvarMovimentacao = async () => {
  if (!formValido.value) return
  try {
    if (editandoId.value) {
      await api.put(`/movimentacoes/${editandoId.value}`, formMovimentacao.value)
    } else {
      await api.post('/movimentacoes', formMovimentacao.value)
    }
    dialogMovimentacao.value = false
    await buscarMovimentacoes()
  } catch (error) {
    alert('Erro ao salvar movimentação')
    console.error(error)
  }
}

const confirmarDelete = async (mov) => {
  if (confirm(`Excluir movimentação de R$ ${mov.valor}?`)) {
    try {
      await api.delete(`/movimentacoes/${mov.id}`)
      await buscarMovimentacoes()
    } catch (error) {
      alert('Erro ao excluir')
    }
  }
}

const carregarDadosApoio = async () => {
  try {
    const [cat, fp, resp, rec, banc, rot, bancVin] = await Promise.all([
      api.get('/categorias'),
      api.get('/formas-pagamento'),
      api.get('/responsaveis'),
      api.get('/recebedores'),
      api.get('/bancos-sistema'),
      api.get('/rotulos'),
      api.get('/bancos-usuario')
    ])
    categorias.value = cat.data
    formasPagamento.value = fp.data
    responsaveis.value = resp.data
    recebedores.value = rec.data
    bancos.value = banc.data
    rotulos.value = rot.data
    bancosVinculados.value = bancVin.data.map(b => ({
      id: b.id,
      nome: b.banco_nome || b.nome_conta || b.nome
    }))
  } catch (error) {
    console.error('Erro ao carregar dados de apoio', error)
  }
}

onMounted(() => {
  carregarDadosApoio()
  buscarMovimentacoes()
})
</script>

<style scoped>
.text-green {
  color: #2e7d32;
  font-weight: 500;
}
.text-red {
  color: #c62828;
  font-weight: 500;
}
</style>