<template>
  <v-row class="mb-6">
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>📊 {{ campoAgrupamentoLabel }}</span>
          <v-select
            v-model="campoSelecionado"
            :items="opcoesAgrupamento"
            item-value="value"
            item-title="text"
            label="Agrupar por"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 200px"
          />
        </v-card-title>
        <v-card-text>
          <div style="height: 300px; max-width: 400px; margin: 0 auto;">
            <apexchart
              v-if="dadosGrafico.labels.length > 0"
              width="380"
              type="donut"
              :options="chartOptions"
              :series="dadosGrafico.series"
            />
            <v-alert v-else type="info" class="ma-4">
              Nenhum dado para exibir no gráfico.
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card style="height: 100%;">
        <v-card-title>📋 Resumo dos dados</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item v-for="(item, index) in dadosGrafico.labels" :key="index">
              <template v-slot:prepend>
                <v-avatar :color="cores[index % cores.length]" size="20" style="border-radius: 50%;" />
              </template>
              <v-list-item-title>{{ item }}</v-list-item-title>
              <v-list-item-subtitle class="text-right">
                R$ {{ formatarMoeda(dadosGrafico.series[index]) }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="dadosGrafico.labels.length === 0">
              <v-list-item-title>Nenhum dado disponível</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { formatarMoeda } from '../utils/formatUtils'

const props = defineProps({
  movimentacoes: {
    type: Array,
    required: true,
    default: () => []
  },
  opcoesAgrupamento: {
    type: Array,
    required: true,
    default: () => [
      { value: 'categoria_nome', text: 'Categoria' },
      { value: 'responsavel_nome', text: 'Responsável' },
      { value: 'recebedor_nome', text: 'Recebedor' },
      { value: 'rotulo_nome', text: 'Rótulo' },
      { value: 'banco_origem_nome', text: 'Banco Origem' },
      { value: 'banco_destino_nome', text: 'Banco Destino' },
      { value: 'forma_pagamento_nome', text: 'Forma de Pagamento' }
    ]
  },
  modelValue: {
    type: String,
    default: 'categoria_nome'
  }
})

const emit = defineEmits(['update:modelValue'])

// Cores para o gráfico
const cores = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#C9CBCF', '#FF6384', '#36A2EB', '#FFCE56'
]

// Campo selecionado (v-model)
const campoSelecionado = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Label do campo selecionado
const campoAgrupamentoLabel = computed(() => {
  const found = props.opcoesAgrupamento.find(o => o.value === campoSelecionado.value)
  return found ? found.text : campoSelecionado.value
})

// Dados do gráfico
const dadosGrafico = computed(() => {
  const items = props.movimentacoes
  const agrupado = {}
  for (const item of items) {
    const chave = item[campoSelecionado.value] || 'Sem categoria'
    const valor = parseFloat(item.valor) || 0
    agrupado[chave] = (agrupado[chave] || 0) + valor
  }
  const labels = Object.keys(agrupado)
  const series = Object.values(agrupado)
  return { labels, series }
})

// Opções do gráfico (corrigido)
const chartOptions = computed(() => ({
  labels: dadosGrafico.value.labels,
  legend: {
    position: 'bottom',
    fontSize: '12px'
  },
  colors: cores.slice(0, dadosGrafico.value.series.length),
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  ]
}))
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>