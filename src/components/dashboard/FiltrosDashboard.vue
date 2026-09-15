<!-- src/components/dashboard/FiltrosDashboard.vue -->
<template>
  <v-card class="mb-4" variant="outlined">
    <v-card-title class="d-flex align-center">
      <span class="text-h6">🔍 Filtros</span>
      <v-spacer />
      <v-btn icon variant="text" color="primary" title="Restaurar filtros padrão (últimos 30 dias)" @click="resetar">
        <v-icon>mdi-restore</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Filtros de data -->
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="filtros.dataInicio" label="De (mov.)" type="date" variant="outlined"
            density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="filtros.dataFim" label="Até (mov.)" type="date" variant="outlined" density="compact"
            hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="filtros.dataRegistroInicio" label="De (data registro)" type="date" variant="outlined"
            density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="filtros.dataRegistroFim" label="Até (data registro)" type="date" variant="outlined"
            density="compact" hide-details clearable />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Filtros avançados -->
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-text-field v-model="filtros.descricao" label="Descrição (contém)" variant="outlined" density="compact"
            hide-details placeholder="Filtrar por descrição" clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.categoria" label="Categoria (igual)" :items="categorias" item-title="nome"
            item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.formaPagamento" label="Forma de pagamento (igual)" :items="formasPagamento"
            item-title="nome" item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.responsavel" label="Responsável (igual)" :items="responsaveis" item-title="nome"
            item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.recebedor" label="Recebedor (igual)" :items="recebedores" item-title="nome"
            item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.bancoOrigem" label="Banco origem (igual)" :items="bancos" item-title="nome"
            item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.bancoDestino" label="Banco destino (igual)" :items="bancos" item-title="nome"
            item-value="nome" variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.rotulo" label="Rótulo (igual)" :items="rotulos" item-title="nome" item-value="nome"
            variant="outlined" density="compact" hide-details clearable />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="filtros.tipo" label="Tipo (igual)" :items="tiposMovimentacao" item-title="nome"
            item-value="tipo" variant="outlined" density="compact" hide-details clearable />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { dataAtualISO, dataAtrasISO } from '@/utils/dateUtils'

const props = defineProps({
  filtros: {
    type: Object,
    required: true,
  },
  categorias: {
    type: Array,
    default: () => [],
  },
  formasPagamento: {
    type: Array,
    default: () => [],
  },
  responsaveis: {
    type: Array,
    default: () => [],
  },
  recebedores: {
    type: Array,
    default: () => [],
  },
  bancos: {
    type: Array,
    default: () => [],
  },
  rotulos: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:filtros', 'reset'])

// Tipos de movimentação
const tiposMovimentacao = [
  { nome: 'Entrada', tipo: 'ENTRADA' },
  { nome: 'Saída', tipo: 'SAIDA' },
  { nome: 'Transferência', tipo: 'TRANSFERENCIA' },
]

// Computed para two-way binding do v-model no pai
const filtros = computed({
  get: () => props.filtros,
  set: (value) => emit('update:filtros', value),
})

// Reset para filtros padrão (últimos 30 dias)
const resetar = () => {
  emit('reset')
}
</script>