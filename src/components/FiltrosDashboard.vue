<template>
  <v-card class="mb-6" variant="outlined">
    <v-card-title class="d-flex align-center">
      <span class="text-h6">🔍 Filtros</span>
      <v-spacer />
      <v-btn
        icon
        variant="text"
        color="primary"
        title="Restaurar filtros padrão (últimos 30 dias)"
        @click="resetarFiltros"
      >
        <v-icon>mdi-restore</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Linha de filtros de data (movimentação e registro) -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="filtros.dataInicio"
            label="Data início (mov.)"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('dataInicio', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="filtros.dataFim"
            label="Data fim (mov.)"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('dataFim', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="filtros.dataRegistroInicio"
            label="Data registro início"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('dataRegistroInicio', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            :model-value="filtros.dataRegistroFim"
            label="Data registro fim"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('dataRegistroFim', $event)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Filtros avançados -->
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-text-field
            :model-value="filtros.descricao"
            label="Descrição (contém)"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="Filtrar por descrição"
            clearable
            @update:model-value="atualizarFiltro('descricao', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.categoria"
            label="Categoria (igual)"
            :items="categorias"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('categoria', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.formaPagamento"
            label="Forma de pagamento (igual)"
            :items="formasPagamento"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('formaPagamento', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.responsavel"
            label="Responsável (igual)"
            :items="responsaveis"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('responsavel', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.recebedor"
            label="Recebedor (igual)"
            :items="recebedores"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('recebedor', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.bancoOrigem"
            label="Banco origem (igual)"
            :items="bancos"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('bancoOrigem', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.bancoDestino"
            label="Banco destino (igual)"
            :items="bancos"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('bancoDestino', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.rotulo"
            label="Rótulo (igual)"
            :items="rotulos"
            item-title="nome"
            item-value="nome"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('rotulo', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            :model-value="filtros.tipo"
            label="Tipo (igual)"
            :items="tiposMovimentacao"
            item-title="nome"
            item-value="tipo"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="atualizarFiltro('tipo', $event)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { dataAtualISO, dataAtrasISO } from '../utils/dateUtils'

// Props: recebe os filtros e as listas de opções
const props = defineProps({
  filtros: {
    type: Object,
    required: true
  },
  categorias: {
    type: Array,
    default: () => []
  },
  formasPagamento: {
    type: Array,
    default: () => []
  },
  responsaveis: {
    type: Array,
    default: () => []
  },
  recebedores: {
    type: Array,
    default: () => []
  },
  bancos: {
    type: Array,
    default: () => []
  },
  rotulos: {
    type: Array,
    default: () => []
  },
  tiposMovimentacao: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:filtros', 'reset'])

// Método para atualizar um campo específico do filtro
const atualizarFiltro = (campo, valor) => {
  const novosFiltros = { ...props.filtros, [campo]: valor }
  emit('update:filtros', novosFiltros)
}

// Resetar filtros para os valores padrão
const resetarFiltros = () => {
  const filtrosPadrao = {
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
  emit('reset', filtrosPadrao)
}
</script>

<style scoped>
/* Estilos específicos se necessário */
</style>