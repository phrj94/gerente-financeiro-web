<template>
    <div>
        <v-container fluid>
            <!-- Título e botão adicionar -->
            <v-row class="align-center justify-space-between mb-4">
                <v-col cols="12" sm="auto">
                    <h1 class="text-h5 text-sm-h4">📋 Minhas Movimentações</h1>
                </v-col>
                <v-col cols="12" sm="auto" class="text-right">
                    <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirDialogMovimentacao">
                        Nova Movimentação
                    </v-btn>
                </v-col>
            </v-row>

            <v-row v-if="perfisMovimentacao.length > 0" class="mb-4">
                <v-col cols="12">
                    <v-btn
                    v-for="perfil in perfisMovimentacao"
                    :key="perfil.id"
                    color="secondary"
                    variant="tonal"
                    class="mr-2 mb-2"
                    @click="abrirComPerfilMovimentacao(perfil)"
                    >
                    <v-icon left>mdi-application</v-icon>
                    {{ perfil.nome }}
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Filtros -->
            <v-card class="mb-6" variant="outlined">
                <v-card-text>
                    <!-- Filtros de data -->
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field v-model="filtros.dataInicio" label="Data início" type="date" variant="outlined"
                                density="compact" hide-details />
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field v-model="filtros.dataFim" label="Data fim" type="date" variant="outlined"
                                density="compact" hide-details />
                        </v-col>
                        <v-col cols="12" sm="12" md="4" class="d-flex align-center">
                            <v-btn color="primary" variant="tonal" @click="buscarMovimentacoes" class="mr-2" title="Filtrar">
                                <v-icon left>mdi-filter</v-icon>
                            </v-btn>
                            <v-btn variant="outlined" @click="limparFiltros" title="Limpar">
                                <v-icon left>mdi-filter-remove</v-icon>
                            </v-btn>
                            <v-btn variant="text" @click="mostrarFiltrosAvancados = !mostrarFiltrosAvancados" class="ml-2" title="Filtros avançados">
                                <v-icon>{{ mostrarFiltrosAvancados ? 'mdi-filter-minus' : 'mdi-filter-plus' }}</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- Filtros avançados (expansível) -->
                    <v-expand-transition>
                        <div v-show="mostrarFiltrosAvancados">
                            <v-divider class="my-4"></v-divider>
                            <v-row>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-text-field v-model="filtros.descricao" label="Descrição (contém)" 
                                        variant="outlined" density="compact" hide-details 
                                        placeholder="Filtrar por descrição"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.categoria" label="Categoria (igual)" 
                                        :items="categorias" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.formaPagamento" label="Forma de pagamento (igual)" 
                                        :items="formasPagamento" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.responsavel" label="Responsável (igual)" 
                                        :items="responsaveis" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.recebedor" label="Recebedor (igual)" 
                                        :items="recebedores" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.bancoOrigem" label="Banco origem (igual)" 
                                        :items="bancos" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.bancoDestino" label="Banco destino (igual)" 
                                        :items="bancos" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.rotulo" label="Rótulo (igual)" 
                                        :items="rotulos" item-title="nome" item-value="nome" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4" lg="3">
                                    <v-select v-model="filtros.tipo" label="Tipo (igual)" 
                                        :items="tiposMovimentacao" item-title="nome" item-value="tipo" 
                                        variant="outlined" density="compact" hide-details clearable/>
                                </v-col>
                            </v-row>
                        </div>
                    </v-expand-transition>
                </v-card-text>
            </v-card>

            <!-- Cards de resumo (calculados a partir dos dados filtrados) -->
            <v-row class="mb-6">
                <v-col cols="12" sm="4">
                    <v-card color="green-lighten-5" variant="tonal">
                        <v-card-text class="text-center">
                            <div class="text-subtitle1 font-weight-medium text-green-darken-2">💰 Entradas</div>
                            <div class="text-h5 text-green-darken-2">
                                R$ {{ (resumoFiltrado.total_entradas || 0).toFixed(2) }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-card color="red-lighten-5" variant="tonal">
                        <v-card-text class="text-center">
                            <div class="text-subtitle1 font-weight-medium text-red-darken-2">💸 Saídas</div>
                            <div class="text-h5 text-red-darken-2">
                                R$ {{ (resumoFiltrado.total_saidas || 0).toFixed(2) }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-card :color="saldoColor" variant="tonal">
                        <v-card-text class="text-center">
                            <div class="text-subtitle1 font-weight-medium" :class="saldoClass">⚖️ Saldo</div>
                            <div class="text-h5" :class="saldoClass">
                                R$ {{ (resumoFiltrado.saldo || 0).toFixed(2) }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Tabela de movimentações responsiva -->
            <v-card>
                <v-data-table :headers="headers" :items="movimentacoesFiltradas" :loading="loading" items-per-page="-1"
                    hide-default-footer class="elevation-0">
                    <!-- Coluna valor com cor condicional -->
                    <template v-slot:item.valor="{ item }">
                        <span :class="item.tipo_operacao === 'ENTRADA' ? 'text-green' : 'text-red'">
                            R$ {{ parseFloat(item.valor).toFixed(2) }}
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
                        <v-btn icon variant="text" size="small" @click="editarMovimentacao(item)">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" size="small" color="error" @click="confirmarDelete(item)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>

                    <!-- Placeholder vazio -->
                    <template v-slot:no-data>
                        <v-alert type="info" class="ma-4">
                            Nenhuma movimentação encontrada.
                        </v-alert>
                    </template>
                </v-data-table>
            </v-card>
        </v-container>

        <!-- Dialog de formulário de movimentação (simplificado) -->
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
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { dataAtualISO, dataAtrasISO } from '../utils/dateUtils'

// Dados da tabela
const movimentacoes = ref([])
const loading = ref(false)

// Filtros
const filtros = ref({ 
    dataInicio: dataAtrasISO(30), 
    dataFim: dataAtualISO(),
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
const mostrarFiltrosAvancados = ref(false)

// Lista de tipos para filtro
const tiposMovimentacao = [
    { nome: 'Entrada', tipo: 'ENTRADA' },
    { nome: 'Saída', tipo: 'SAIDA' },
    { nome: 'Transferência', tipo: 'TRANSFERENCIA' }
]

// Headers da tabela
const headers = [
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

// Movimentações filtradas (aplicando filtros avançados)
const movimentacoesFiltradas = computed(() => {
    let items = movimentacoes.value
    const f = filtros.value

    if (f.descricao) {
        const termo = f.descricao.toLowerCase()
        items = items.filter(item => 
            item.descricao && item.descricao.toLowerCase().includes(termo)
        )
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

// Resumo calculado a partir dos dados filtrados
const resumoFiltrado = computed(() => {
    const items = movimentacoesFiltradas.value
    let total_entradas = 0
    let total_saidas = 0
    for (const item of items) {
        const valor = parseFloat(item.valor) || 0
        if (item.tipo_operacao === 'ENTRADA') {
            total_entradas += valor
        } else if (item.tipo_operacao === 'SAIDA') {
            total_saidas += valor
        }
        // Transferências não entram no resumo
    }
    return {
        total_entradas,
        total_saidas,
        saldo: total_entradas - total_saidas
    }
})

// Computed para cor do card saldo
const saldoColor = computed(() => {
    const saldo = resumoFiltrado.value.saldo
    if (saldo > 0) return 'green-lighten-5'
    if (saldo < 0) return 'red-lighten-5'
    return 'grey-lighten-3'
})
const saldoClass = computed(() => {
    const saldo = resumoFiltrado.value.saldo
    if (saldo > 0) return 'text-green-darken-2'
    if (saldo < 0) return 'text-red-darken-2'
    return ''
})

// Dialog e formulário
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

//Perfis de movimentação
const perfisMovimentacao = ref([])

const carregarPerfisMovimentacao = async () => {
  try {
    const res = await api.get('/perfisMovimentacao')
    perfisMovimentacao.value = res.data || []
  } catch (error) {
    console.error('Erro ao carregar perfis de movimentação', error)
  }
}

const abrirComPerfilMovimentacao = (perfil) => {
  // Preenche o formulário com os campos do perfil
  formMovimentacao.value = {
    id_categoria: perfil.campos.id_categoria || null,
    id_pagamento: perfil.campos.id_pagamento || null,
    valor: null, // deixar em branco para o usuário preencher
    data_movimentacao: new Date().toISOString().slice(0, 10),
    descricao: perfil.campos.descricao || '',
    id_responsavel: perfil.campos.id_responsavel || null,
    id_recebedor: perfil.campos.id_recebedor || null,
    id_banco: perfil.campos.id_banco || null,
    id_rotulo: perfil.campos.id_rotulo || null,
    id_banco_recebedor: perfil.campos.id_banco_recebedor || null
  }
  editandoId.value = null
  dialogMovimentacao.value = true
}

// Listas para selects (buscar da API)
const categorias = ref([])
const formasPagamento = ref([])
const responsaveis = ref([])
const recebedores = ref([])
const bancos = ref([])
const rotulos = ref([])

// Métodos
const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
}

const buscarMovimentacoes = async () => {
    loading.value = true
    try {
        let url = '/movimentacoes/'
        const params = new URLSearchParams()
        if (filtros.value.dataInicio) params.append('dataInicio', filtros.value.dataInicio)
        if (filtros.value.dataFim) params.append('dataFim', filtros.value.dataFim)
        if (params.toString()) url += `?${params.toString()}`

        const resMov = await api.get(url)
        movimentacoes.value = resMov.data || []
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const limparFiltros = () => {
    filtros.value = { 
        dataInicio: '', 
        dataFim: dataAtualISO(),
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
    buscarMovimentacoes()
}

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
        const [cat, fp, resp, rec, banc, rot] = await Promise.all([
            api.get('/categorias'),
            api.get('/formas-pagamento'),
            api.get('/responsaveis'),
            api.get('/recebedores'),
            api.get('/bancos-sistema'),
            api.get('/rotulos')
        ])
        categorias.value = cat.data
        formasPagamento.value = fp.data
        responsaveis.value = resp.data
        recebedores.value = rec.data
        bancos.value = banc.data
        rotulos.value = rot.data
    } catch (error) {
        console.error('Erro ao carregar dados de apoio', error)
    }
}

onMounted(() => {
    carregarDadosApoio()
    buscarMovimentacoes()
    carregarPerfisMovimentacao()
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