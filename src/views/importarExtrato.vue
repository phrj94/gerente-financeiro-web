<template>
  <div style="padding-bottom: 80px;">
    <h1 class="text-h5 mb-4">📥 Importar Extrato</h1>

    <!-- Etapa 1: Upload -->
    <v-card class="mb-4" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="3">
            <v-select v-model="bancoId" :items="bancos" item-title="nome" item-value="id" label="Banco do extrato"
              variant="outlined" density="compact" hide-details />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="mesReferencia" label="Mês da Fatura" type="month" variant="outlined"
              density="compact" hide-details />
          </v-col>
          <v-col cols="12" sm="6">
            <v-file-input v-model="arquivo" label="Arquivo CSV" accept=".csv,text/csv" variant="outlined"
              density="compact" hide-details prepend-icon="" prepend-inner-icon="mdi-file-delimited" />
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn color="primary" block :loading="analisando" :disabled="!arquivo || !bancoId" @click="analisar">
              Analisar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="erroAnalise" type="error" variant="tonal" class="mb-4" closable @click:close="erroAnalise = null">
      {{ erroAnalise }}
    </v-alert>

    <!-- Etapa 2: Cards de review -->
    <template v-if="cardsVisiveis.length > 0">
      <!-- Barra fixa de ações em massa -->
      <v-sheet class="action-bar d-flex align-center pa-3" elevation="6"
        style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;">
        <v-checkbox :model-value="todosSelecionados" :indeterminate="algunsSelecionados"
          @update:model-value="toggleSelecionarTodos" density="compact" hide-details class="mr-2" label="Todos" />
        <v-chip size="small" color="primary" variant="tonal" class="mr-3">
          {{ selecionados.size }} de {{ cardsVisiveis.length }}
        </v-chip>
        <v-spacer />
        <v-btn color="error" variant="tonal" size="small" prepend-icon="mdi-delete" class="mr-2"
          :disabled="selecionados.size === 0 || salvandoLote" @click="deletarSelecionados">
          Remover ({{ selecionados.size }})
        </v-btn>
        <v-btn color="success" size="small" prepend-icon="mdi-content-save-all" :loading="salvandoLote"
          :disabled="selecionados.size === 0" @click="salvarSelecionados">
          Salvar ({{ selecionados.size }})
        </v-btn>
      </v-sheet>

      <!-- Lista de cards -->
      <div class="mb-6">
        <div class="d-flex align-center mb-2">
          <span class="text-h6">Review de movimentações</span>
          <v-chip size="small" class="ml-2" color="primary">
            {{ cardsVisiveis.length }}
          </v-chip>
        </div>

        <CardMovimentacaoImportada v-for="item in cardsVisiveis" :key="item.indexOriginal"
          :ref="(el) => setCardRef(el, item.indexOriginal)" :movimentacao="item.mov"
          :movimentacao-index="item.indexOriginal" :selecionado="selecionados.has(item.indexOriginal)"
          :status="statusPorIndex[item.indexOriginal] || 'pendente'" :categorias="categorias"
          :formas-pagamento="formasPagamento" :responsaveis="responsaveis" :recebedores="recebedores" :bancos="bancos"
          :rotulos="rotulos" @toggle-selecionado="toggleSelecionado" @deletar="deletarCard" @salvo="marcarSalvo" />
      </div>
    </template>

    <!-- Resultado final do lote -->
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="4000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import CardMovimentacaoImportada from '@/components/importacao/CardMovimentacaoImportada.vue'

// ---------- Estado do upload ----------
const bancos = ref([])
const bancoId = ref(null)
const arquivo = ref(null)
const analisando = ref(false)
const erroAnalise = ref(null)
const resultado = ref(null)
const mesReferencia = ref('')

// ---------- Dados de apoio (categorias etc.) ----------
const categorias = ref([])
const formasPagamento = ref([])
const responsaveis = ref([])
const recebedores = ref([])
const rotulos = ref([])

// ---------- Estado dos cards ----------
const selecionados = ref(new Set())
const removidos = ref(new Set()) // índices removidos da review
const statusPorIndex = ref({}) // { index: 'salvo' | 'erro' }
const cardRefs = ref({})

const salvandoLote = ref(false)
const snackbar = ref({ visible: false, message: '', color: 'success' })

// ---------- Computed ----------
const cardsVisiveis = computed(() => {
  if (!resultado.value) return []
  return resultado.value.movimentacoes
    .map((mov, idx) => ({ mov, indexOriginal: idx }))
    .filter((item) => !removidos.value.has(item.indexOriginal))
    .filter((item) => statusPorIndex.value[item.indexOriginal] !== 'salvo')
})

const todosSelecionados = computed(() => {
  if (cardsVisiveis.value.length === 0) return false
  return cardsVisiveis.value.every((c) => selecionados.value.has(c.indexOriginal))
})

const algunsSelecionados = computed(() => {
  const qtd = cardsVisiveis.value.filter((c) => selecionados.value.has(c.indexOriginal)).length
  return qtd > 0 && qtd < cardsVisiveis.value.length
})

// ---------- Carregar bancos e dados de apoio ----------
onMounted(async () => {
  try {
    const [b, c, fp, resp, rot] = await Promise.all([
      api.get('/apoio/bancos'),
      api.get('/apoio/categorias'),
      api.get('/apoio/formas-pagamento'),
      api.get('/apoio/responsaveis'),
      api.get('/apoio/rotulos'),
    ])
    bancos.value = b.data.data || b.data
    categorias.value = c.data.data || c.data
    formasPagamento.value = fp.data.data || fp.data
    responsaveis.value = resp.data.data || resp.data
    recebedores.value = resp.data.data || resp.data
    rotulos.value = rot.data.data || rot.data

    const c6 = bancos.value.find((x) => x.nome.toLowerCase().includes('c6'))
    if (c6) bancoId.value = c6.id
  } catch (e) {
    console.error('Erro ao carregar dados de apoio:', e)
  }
})

// ---------- Analisar extrato ----------
const analisar = async () => {
  if (!arquivo.value || !bancoId.value) return
  analisando.value = true
  erroAnalise.value = null
  resultado.value = null
  selecionados.value = new Set()
  removidos.value = new Set()
  statusPorIndex.value = {}

  try {
    const fd = new FormData()
    fd.append('extrato', arquivo.value)
    fd.append('bancoId', bancoId.value)
    if (mesReferencia.value) {
      fd.append('mesReferencia', mesReferencia.value)
    }
    const res = await api.post('/extratos/analisar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    resultado.value = res.data.data || res.data

    // Seleciona todas por padrão
    resultado.value.movimentacoes.forEach((_, i) => selecionados.value.add(i))
  } catch (e) {
    erroAnalise.value = e.response?.data?.erro || e.message
  } finally {
    analisando.value = false
  }
}

// ---------- Seleção ----------
const toggleSelecionado = (idx) => {
  const novo = new Set(selecionados.value)
  if (novo.has(idx)) novo.delete(idx)
  else novo.add(idx)
  selecionados.value = novo
}

const toggleSelecionarTodos = () => {
  if (todosSelecionados.value) {
    selecionados.value = new Set()
  } else {
    const novo = new Set()
    cardsVisiveis.value.forEach((c) => novo.add(c.indexOriginal))
    selecionados.value = novo
  }
}

// ---------- Deleção ----------
const deletarCard = (idx) => {
  removidos.value.add(idx)
  const novo = new Set(selecionados.value)
  novo.delete(idx)
  selecionados.value = novo
}

const deletarSelecionados = () => {
  selecionados.value.forEach((idx) => removidos.value.add(idx))
  selecionados.value = new Set()
}

// ---------- Refs dos cards ----------
const setCardRef = (el, idx) => {
  if (el) cardRefs.value[idx] = el
  else delete cardRefs.value[idx]
}

// ---------- Salvamento em lote ----------
const salvarSelecionados = async () => {
  const indices = Array.from(selecionados.value).filter(
    (idx) => cardsVisiveis.value.some((c) => c.indexOriginal === idx)
  )
  if (indices.length === 0) return

  salvandoLote.value = true
  const payload = indices
    .map((idx) => {
      const card = cardRefs.value[idx]
      if (!card) return null
      const dados = card.getDados()
      return {
        ...dados,
        valor: parseFloat(dados.valor),
      }
    })
    .filter(Boolean)

  try {
    const res = await api.post('/extratos/confirmar', { movimentacoes: payload, bancoId: bancoId.value, mesReferencia: mesReferencia.value })
    const { salvos, erros } = res.data.data || res.data

    // Marca os que deram certo
    salvos.forEach((s) => {
      const idx = indices[s.index]
      statusPorIndex.value[idx] = 'salvo'
      removidos.value.add(idx)
    })
    // Marca os que deram erro
    erros.forEach((e) => {
      const idx = indices[e.index]
      statusPorIndex.value[idx] = 'erro'
    })

    selecionados.value = new Set()
    snackbar.value = {
      visible: true,
      message: `${salvos.length} salva(s), ${erros.length} com erro.`,
      color: erros.length ? 'warning' : 'success',
    }
  } catch (e) {
    snackbar.value = {
      visible: true,
      message: e.response?.data?.erro || e.message,
      color: 'error',
    }
  } finally {
    salvandoLote.value = false
  }
}

const marcarSalvo = (idx) => {
  statusPorIndex.value[idx] = 'salvo'
  removidos.value.add(idx)
}
</script>

<style scoped>
.action-bar {
  background-color: white;
  border-top: 1px solid #e0e0e0;
}
</style>