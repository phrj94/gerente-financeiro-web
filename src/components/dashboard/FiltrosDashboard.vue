<!-- src/components/dashboard/FiltrosDashboard.vue -->
<template>
  <v-card class="mb-4" variant="outlined">
    <!-- Cabeçalho com botão de expandir/recolher, badge e reset -->
    <v-card-title class="d-flex align-center flex-wrap">
      <v-icon class="mr-2">mdi-filter</v-icon>
      <span class="text-h6">Filtros</span>

      <!-- Badge com quantidade de filtros ativos -->
      <v-chip
        v-if="quantidadeFiltrosAtivos > 0"
        color="primary"
        size="small"
        class="ml-2"
      >
        {{ quantidadeFiltrosAtivos }}
      </v-chip>

      <v-spacer />

      <!-- Botão para expandir/recolher -->
      <v-btn
        icon
        variant="text"
        color="primary"
        :title="expandido ? 'Recolher filtros' : 'Expandir filtros'"
        @click="expandido = !expandido"
      >
        <v-icon>{{ expandido ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>

      <!-- Botão de reset (mantido) -->
      <v-btn
        icon
        variant="text"
        color="primary"
        title="Restaurar filtros padrão (últimos 30 dias)"
        @click="resetar"
      >
        <v-icon>mdi-restore</v-icon>
      </v-btn>
    </v-card-title>

    <!-- Resumo dos filtros ativos (visível apenas quando colapsado) -->
    <v-card-subtitle v-if="!expandido && resumoFiltros" class="pb-2">
      <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
      {{ resumoFiltros }}
    </v-card-subtitle>

    <!-- Conteúdo colapsável -->
    <v-expand-transition>
      <div v-show="expandido">
        <v-card-text>
          <!-- Filtros de data -->
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="filtros.dataInicio"
                label="De (mov.)"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="filtros.dataFim"
                label="Até (mov.)"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="filtros.dataRegistroInicio"
                label="De (data registro)"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="filtros.dataRegistroFim"
                label="Até (data registro)"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Filtros avançados (sem agrupamento) -->
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model="filtros.descricao"
                label="Descrição (contém)"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Filtrar por descrição"
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.categoria"
                label="Categoria (igual)"
                :items="categorias"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.formaPagamento"
                label="Forma de pagamento (igual)"
                :items="formasPagamento"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.responsavel"
                label="Responsável (igual)"
                :items="responsaveis"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.recebedor"
                label="Recebedor (igual)"
                :items="recebedores"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.bancoOrigem"
                label="Banco origem (igual)"
                :items="bancos"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.bancoDestino"
                label="Banco destino (igual)"
                :items="bancos"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.rotulo"
                label="Rótulo (igual)"
                :items="rotulos"
                item-title="nome"
                item-value="nome"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-select
                v-model="filtros.tipo"
                label="Tipo (igual)"
                :items="tiposMovimentacao"
                item-title="nome"
                item-value="tipo"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { dataAtualISO, dataAtrasISO } from '@/utils/dateUtils'

const props = defineProps({
  filtros: {
    type: Object,
    required: true,
  },
  categorias: { type: Array, default: () => [] },
  formasPagamento: { type: Array, default: () => [] },
  responsaveis: { type: Array, default: () => [] },
  recebedores: { type: Array, default: () => [] },
  bancos: { type: Array, default: () => [] },
  rotulos: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filtros', 'reset'])

// Estado de expansão (inicia colapsado)
const expandido = ref(false)

// Tipos de movimentação (para o filtro de tipo)
const tiposMovimentacao = [
  { nome: 'Entrada', tipo: 'ENTRADA' },
  { nome: 'Saída', tipo: 'SAIDA' },
  { nome: 'Transferência', tipo: 'TRANSFERENCIA' },
]

// Computed para v-model (two-way binding com o pai)
const filtros = computed({
  get: () => props.filtros,
  set: (value) => emit('update:filtros', value),
})

// Lista de filtros ativos (excluindo os padrões de data)
const filtrosAtivos = computed(() => {
  const ativos = []
  const f = props.filtros

  if (f.dataInicio) {
    ativos.push({ label: `De: ${formatarData(f.dataInicio)}`, tipo: 'data' })
  }
  if (f.dataFim) {
    ativos.push({ label: `Até: ${formatarData(f.dataFim)}`, tipo: 'data' })
  }
  if (f.dataRegistroInicio) {
    ativos.push({ label: `Reg. De: ${formatarData(f.dataRegistroInicio)}`, tipo: 'data' })
  }
  if (f.dataRegistroFim) {
    ativos.push({ label: `Reg. Até: ${formatarData(f.dataRegistroFim)}`, tipo: 'data' })
  }

  // Outros filtros
  if (f.descricao) ativos.push({ label: `Desc: "${f.descricao}"`, tipo: 'texto' })
  if (f.categoria) ativos.push({ label: `Cat: ${f.categoria}`, tipo: 'select' })
  if (f.formaPagamento) ativos.push({ label: `Pag: ${f.formaPagamento}`, tipo: 'select' })
  if (f.responsavel) ativos.push({ label: `Resp: ${f.responsavel}`, tipo: 'select' })
  if (f.recebedor) ativos.push({ label: `Receb: ${f.recebedor}`, tipo: 'select' })
  if (f.bancoOrigem) ativos.push({ label: `Banco: ${f.bancoOrigem}`, tipo: 'select' })
  if (f.bancoDestino) ativos.push({ label: `Dest: ${f.bancoDestino}`, tipo: 'select' })
  if (f.rotulo) ativos.push({ label: `Rót: ${f.rotulo}`, tipo: 'select' })
  if (f.tipo) ativos.push({ label: `Tipo: ${f.tipo}`, tipo: 'select' })

  return ativos
})

// Quantidade de filtros ativos
const quantidadeFiltrosAtivos = computed(() => filtrosAtivos.value.length)

// Resumo textual dos filtros ativos
const resumoFiltros = computed(() => {
  if (filtrosAtivos.value.length === 0) return null
  return filtrosAtivos.value.map((f) => f.label).join(' · ')
})

// Formata data para exibição no resumo (dd/mm/aaaa)
function formatarData(dataISO) {
  if (!dataISO) return ''
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

// Resetar filtros (emite evento para o pai)
const resetar = () => {
  emit('reset')
}
</script>