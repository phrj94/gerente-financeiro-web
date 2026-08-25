<template>
  <v-card>
    <v-card-title>📋 Movimentações</v-card-title>
    <v-data-table
      :headers="headers"
      :items="movimentacoes"
      :loading="loading"
      items-per-page="-1"
      hide-default-footer
      class="elevation-0"
    >
      <!-- Coluna valor com cor condicional -->
      <template v-slot:item.valor="{ item }">
        <span :class="item.tipo_operacao === 'ENTRADA' ? 'text-green' : 'text-red'">
          R$ {{ formatarMoeda(item.valor) }}
        </span>
      </template>

      <!-- Coluna categoria com badge colorida -->
      <template v-slot:item.categoria_nome="{ item }">
        <v-chip :color="item.categoria_cor || '#9E9E9E'" dark size="small" label>
          {{ item.categoria_nome }}
        </v-chip>
      </template>

      <!-- Coluna data formatada -->
      <template v-slot:item.data_movimentacao="{ item }">
        {{ formatarData(item.data_movimentacao) }}
      </template>

      <!-- Ações -->
      <template v-slot:item.actions="{ item }">
        <v-btn icon variant="text" size="small" @click="emit('editar', item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" color="error" @click="emit('deletar', item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="ma-4">
          Nenhuma movimentação encontrada.
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
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
  loading: {
    type: Boolean,
    default: false
  },
  // Permite customizar os cabeçalhos, mas mantém o padrão
  headers: {
    type: Array,
    default: () => [
      { title: 'Data', key: 'data_movimentacao', sortable: true },
      { title: 'Descrição', key: 'descricao' },
      { title: 'Categoria', key: 'categoria_nome' },
      { title: 'Forma Pagamento', key: 'forma_pagamento_nome' },
      { title: 'Responsável', key: 'responsavel_nome' },
      { title: 'Recebedor', key: 'recebedor_nome' },
      { title: 'Banco origem', key: 'banco_origem_nome' },
      { title: 'Banco destino', key: 'banco_destino_nome' },
      { title: 'Rótulo', key: 'rotulo_nome' },
      { title: 'Valor', key: 'valor', align: 'end' },
      { title: 'Ações', key: 'actions', sortable: false, align: 'center' }
    ]
  }
})

const emit = defineEmits(['editar', 'deletar'])

// Funções auxiliares
const formatarData = (data) => {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarValor = (valor) => {
  return parseFloat(valor).toFixed(2)
}
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