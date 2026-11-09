<!-- src/components/dashboard/TabelaMovimentacoes.vue -->
<template>
  <v-card rounded="lg" variant="outlined">
    <v-card-title class="d-flex align-center flex-wrap">
      <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
      <span class="text-h6">Movimentações</span>
      <v-spacer />
      <v-chip size="small" variant="tonal" color="primary" class="ml-2">
        {{ movimentacoes.length }} {{ movimentacoes.length === 1 ? 'registro' : 'registros' }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <!-- Estado vazio (sem movimentações) -->
    <v-alert v-if="!loading && movimentacoes.length === 0" type="info" variant="tonal" class="ma-4">
      Nenhuma movimentação encontrada para o período e filtros selecionados.
    </v-alert>

    <!-- Tabela (desktop) -->
    <v-data-table v-else :headers="headers" :items="movimentacoes" :loading="loading" items-per-page="-1"
      hide-default-footer density="comfortable" class="d-none d-md-table elevation-0"
      :sort-by="[{ key: 'data_movimentacao', order: 'desc' }]">
      <!-- Coluna: Data -->
      <template v-slot:item.data_movimentacao="{ item }">
        {{ formatarData(item.data_movimentacao) }}
      </template>

      <!-- Coluna: Descrição -->
      <template v-slot:item.descricao="{ item }">
        <span class="text-body-2">{{ item.descricao || '—' }}</span>
      </template>

      <!-- Coluna: Categoria -->
      <template v-slot:item.categoria_nome="{ item }">
        <v-chip :color="item.categoria_cor || '#9E9E9E'" size="small" label variant="flat">
          {{ item.categoria_nome }}
        </v-chip>
      </template>

      <!-- Coluna: Forma de Pagamento -->
      <template v-slot:item.forma_pagamento_nome="{ item }">
        <span class="text-body-2">{{ item.forma_pagamento_nome || '—' }}</span>
      </template>

      <!-- Coluna: Responsável -->
      <template v-slot:item.responsavel_nome="{ item }">
        <span class="text-body-2">{{ item.responsavel_nome || '—' }}</span>
      </template>

      <!-- Coluna: Recebedor -->
      <template v-slot:item.recebedor_nome="{ item }">
        <span class="text-body-2">{{ item.recebedor_nome || '—' }}</span>
      </template>

      <!-- Coluna: Banco Origem -->
      <template v-slot:item.banco_origem_nome="{ item }">
        <div v-if="item.banco_origem_nome" class="d-flex align-center">
          <v-icon size="small" color="primary" class="mr-1">mdi-bank-arrow-right</v-icon>
          <span class="text-body-2">{{ item.banco_origem_nome }}</span>
        </div>
        <span v-else class="text-body-2 text-medium-emphasis">—</span>
      </template>

      <!-- Coluna: Banco Destino -->
      <template v-slot:item.banco_destino_nome="{ item }">
        <div v-if="item.banco_destino_nome" class="d-flex align-center">
          <v-icon size="small" color="success" class="mr-1">mdi-bank-arrow-left</v-icon>
          <span class="text-body-2">{{ item.banco_destino_nome }}</span>
        </div>
        <span v-else class="text-body-2 text-medium-emphasis">—</span>
      </template>

      <!-- Coluna: Rótulo -->
      <template v-slot:item.rotulo_nome="{ item }">
        <v-chip v-if="item.rotulo_nome" :color="item.rotulo_cor || 'grey'" size="x-small" variant="tonal" label>
          <v-icon start size="x-small">{{ item.rotulo_icone || 'mdi-tag' }}</v-icon>
          {{ item.rotulo_nome }}
        </v-chip>
        <span v-else class="text-body-2 text-medium-emphasis">—</span>
      </template>

      <!-- Coluna: Valor -->
      <template v-slot:item.valor="{ item }">
        <span class="font-weight-bold"
          :class="item.tipo_operacao === 'ENTRADA' ? 'text-green-darken-2' : 'text-red-darken-2'">
          {{ item.tipo_operacao === 'ENTRADA' ? '+' : '-' }} {{ formatarMoeda(item.valor, false) }}
        </span>
      </template>

      <!-- Coluna: Ações -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-center">
          <v-tooltip text="Editar" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon variant="text" size="small" color="primary" @click="$emit('editar', item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Excluir" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon variant="text" size="small" color="error" @click="$emit('deletar', item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>

    <!-- Lista de cards (mobile) -->
    <div v-if="!loading && movimentacoes.length > 0" class="d-md-none">
      <v-card v-for="item in movimentacoes" :key="item.id" variant="outlined" class="ma-3" rounded="lg">
        <v-card-text class="pb-2">
          <!-- Topo: data + valor -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-1" color="primary">mdi-calendar</v-icon>
              <span class="text-caption">{{ formatarData(item.data_movimentacao) }}</span>
            </div>
            <span class="text-subtitle1 font-weight-bold"
              :class="item.tipo_operacao === 'ENTRADA' ? 'text-green-darken-2' : 'text-red-darken-2'">
              {{ item.tipo_operacao === 'ENTRADA' ? '+' : '-' }} {{ formatarMoeda(item.valor, false) }}
            </span>
          </div>

          <!-- Descrição -->
          <div class="text-body-1 font-weight-medium mb-2">
            {{ item.descricao || 'Sem descrição' }}
          </div>

          <!-- Chips de categoria e rótulo -->
          <div class="d-flex flex-wrap gap-1 mb-2">
            <v-chip :color="item.categoria_cor || 'grey'" size="small" variant="flat" label>
              {{ item.categoria_nome }}
            </v-chip>
            <v-chip v-if="item.rotulo_nome" :color="item.rotulo_cor || 'grey'" size="small" variant="tonal" label>
              {{ item.rotulo_nome }}
            </v-chip>
          </div>

          <!-- Detalhes -->
          <div class="text-caption text-medium-emphasis">
            <div v-if="item.responsavel_nome">
              <v-icon size="x-small">mdi-account</v-icon> {{ item.responsavel_nome }}
            </div>
            <div v-if="item.banco_origem_nome">
              <v-icon size="x-small">mdi-bank-arrow-right</v-icon> {{ item.banco_origem_nome }}
            </div>
            <div v-if="item.banco_destino_nome">
              <v-icon size="x-small">mdi-bank-arrow-left</v-icon> {{ item.banco_destino_nome }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-pencil" @click="$emit('editar', item)">
            Editar
          </v-btn>
          <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete" @click="$emit('deletar', item)">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Loading overlay -->
    <v-overlay :model-value="loading" contained class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" size="48" />
    </v-overlay>
  </v-card>
</template>

<script setup>
import { formatarData } from '@/utils/dateUtils'
import { formatarMoeda } from '@/utils/formatUtils'

defineProps({
  movimentacoes: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['editar', 'deletar'])

// Headers (apenas para desktop)
const headers = [
  { title: 'Data', key: 'data_movimentacao', sortable: true, width: '110px' },
  { title: 'Descrição', key: 'descricao', sortable: false },
  { title: 'Categoria', key: 'categoria_nome', sortable: false },
  { title: 'Pagamento', key: 'forma_pagamento_nome', sortable: false },
  { title: 'Responsável', key: 'responsavel_nome', sortable: false },
  { title: 'Recebedor', key: 'recebedor_nome', sortable: false },
  { title: 'Banco Origem', key: 'banco_origem_nome', sortable: false },
  { title: 'Banco Destino', key: 'banco_destino_nome', sortable: false },
  { title: 'Rótulo', key: 'rotulo_nome', sortable: false },
  { title: 'Valor', key: 'valor', sortable: true, align: 'end', width: '130px' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '100px' },
]
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

/* Ajuste no overlay de loading */
:deep(.v-overlay__content) {
  background: transparent !important;
}
</style>