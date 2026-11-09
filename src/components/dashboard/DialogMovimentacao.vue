<!-- src/components/dashboard/DialogMovimentacao.vue -->
<template>
    <v-dialog v-model="aberto" :fullscreen="isMobile" :max-width="isMobile ? undefined : 900" persistent scrollable>
        <v-card>
            <!-- Toolbar do dialog -->
            <v-toolbar :color="isEdicao ? 'primary' : 'success'" dark density="comfortable">
                <v-toolbar-title class="text-body-1 font-weight-bold">
                    <v-icon class="mr-2">{{ isEdicao ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
                    {{ isEdicao ? 'Editar' : 'Nova' }} Movimentação
                </v-toolbar-title>
                <v-spacer />
                <v-btn icon @click="fechar" :disabled="salvando">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text class="pt-4">
                <v-form ref="formRef" v-model="formValido" @submit.prevent="salvar">
                    <!-- Categoria e Forma de Pagamento -->
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_categoria" :items="categorias" item-title="nome" item-value="id"
                                label="Categoria *" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Categoria é obrigatória']"
                                @update:model-value="onCategoriaChange">
                                <template v-slot:item="{ props: itemProps, item }">
                                    <v-list-item v-bind="itemProps">
                                        <template v-slot:prepend>
                                            <v-icon :color="item.raw.cor" size="small">
                                                {{ item.raw.icone || 'mdi-tag' }}
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_pagamento" :items="formasPagamento" item-title="nome"
                                item-value="id" label="Forma de pagamento *" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Forma de pagamento é obrigatória']"
                                :disabled="isTransferenciaInterna" @update:model-value="onPagamentoChange" />
                        </v-col>
                    </v-row>

                    <!-- Valor e Data -->
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model.number="form.valor" label="Valor *" type="number" step="0.01"
                                min="0.01" prefix="R$" variant="outlined" density="comfortable" :rules="[
                                    v => !!v || 'Valor é obrigatório',
                                    v => v > 0 || 'Valor deve ser positivo'
                                ]" />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model="form.data_movimentacao" label="Data *" type="date" variant="outlined"
                                density="comfortable" :rules="[v => !!v || 'Data é obrigatória']" />
                        </v-col>
                    </v-row>

                    <!-- Responsável e Recebedor -->
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_responsavel" :items="responsaveis" item-title="nome"
                                item-value="id" label="Responsável *" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Responsável é obrigatório']" :disabled="responsavelFixo">
                                <template v-slot:item="{ props: itemProps, item }">
                                    <v-list-item v-bind="itemProps">
                                        <template v-slot:prepend>
                                            <v-icon size="small">
                                                {{ item.raw.tipo === 'BANCO' ? 'mdi-bank' : 'mdi-account' }}
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_recebedor" :items="recebedores" item-title="nome" item-value="id"
                                label="Recebedor *" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Recebedor é obrigatório']" :disabled="recebedorFixo" clearable>
                                <template v-slot:item="{ props: itemProps, item }">
                                    <v-list-item v-bind="itemProps">
                                        <template v-slot:prepend>
                                            <v-icon size="small">
                                                {{ item.raw.tipo === 'BANCO' ? 'mdi-bank' : 'mdi-account' }}
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>

                    <!-- Bancos -->
                    <v-row dense>
                        <v-col cols="12" sm="6" v-if="mostrarBancoOrigem">
                            <v-select v-model="form.id_banco" :items="bancos" item-title="nome" item-value="id"
                                label="Banco origem *" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Banco origem é obrigatório']" clearable>
                                <template v-slot:prepend-inner>
                                    <v-icon color="primary" size="small">mdi-bank-arrow-right</v-icon>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="6" v-if="mostrarBancoDestino">
                            <v-select v-model="form.id_banco_recebedor" :items="bancos" item-title="nome"
                                item-value="id" :label="labelBancoDestino" variant="outlined" density="comfortable"
                                :rules="[v => !!v || 'Banco destino é obrigatório']" clearable>
                                <template v-slot:prepend-inner>
                                    <v-icon color="success" size="small">mdi-bank-arrow-left</v-icon>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>

                    <!-- Rótulo e Descrição -->
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_rotulo" :items="rotulos" item-title="nome" item-value="id"
                                label="Rótulo" variant="outlined" density="comfortable" clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model="form.descricao" label="Descrição" variant="outlined"
                                density="comfortable" counter="500" maxlength="500" />
                        </v-col>
                    </v-row>
                </v-form>

                <!-- Alerta de erro geral -->
                <v-alert v-if="erroGeral" type="error" variant="tonal" class="mt-4" closable
                    @click:close="erroGeral = null">
                    {{ erroGeral }}
                </v-alert>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-btn variant="text" @click="fechar" :disabled="salvando">
                    Cancelar
                </v-btn>
                <v-spacer />
                <v-btn color="primary" variant="flat" :loading="salvando" :disabled="!formValido" @click="salvar"
                    prepend-icon="mdi-content-save">
                    {{ isEdicao ? 'Salvar alterações' : 'Registrar' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import api from '@/services/api'
import { dataAtualISO } from '@/utils/dateUtils'

// ---------- PROPS E EMITS ----------
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    movimentacaoParaEditar: { type: Object, default: null },
    categorias: { type: Array, default: () => [] },
    formasPagamento: { type: Array, default: () => [] },
    responsaveis: { type: Array, default: () => [] },
    recebedores: { type: Array, default: () => [] },
    bancos: { type: Array, default: () => [] },
    rotulos: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'salvo'])

// ---------- ESTADO ----------
const display = useDisplay()
const isMobile = computed(() => display.mobile.value)

const formRef = ref(null)
const formValido = ref(false)
const salvando = ref(false)
const erroGeral = ref(null)

const form = ref(formInicial())

// ---------- COMPUTED ----------
const aberto = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const isEdicao = computed(() => !!props.movimentacaoParaEditar?.id)

// Responsável "Eu mesmo" do usuário
const euMesmo = computed(() => {
    return (
        props.responsaveis.find((r) => r.nome === 'Eu mesmo' && !r.sistema) ||
        props.responsaveis.find((r) => r.nome === 'Eu mesmo')
    )
})

// Categoria selecionada
const categoriaSelecionada = computed(() =>
    props.categorias.find((c) => c.id === form.value.id_categoria)
)

const isRecebimento = computed(
    () => categoriaSelecionada.value?.nome === 'Recebimento'
)
const isPagamentoFatura = computed(
    () => categoriaSelecionada.value?.nome === 'Pagamento de Fatura'
)
const isTransferenciaInterna = computed(
    () => categoriaSelecionada.value?.nome === 'Transferência Interna'
)

// Visibilidade condicional de campos
const mostrarBancoOrigem = computed(
    () => form.value.id_pagamento && form.value.id_pagamento !== 3
)

const mostrarBancoDestino = computed(
    () =>
        isPagamentoFatura.value ||
        isTransferenciaInterna.value ||
        isRecebimento.value
)

// Rótulo dinâmico para banco destino
const labelBancoDestino = computed(() => {
    if (isPagamentoFatura.value) return 'Cartão a ser pago *'
    if (isRecebimento.value) return 'Banco que recebeu *'
    return 'Banco destino *'
})

// Campos fixos (bloqueados para edição)
const responsavelFixo = computed(() => isTransferenciaInterna.value)
const recebedorFixo = computed(
    () => isTransferenciaInterna.value || isRecebimento.value
)

// ---------- HELPERS ----------
function formInicial() {
    return {
        id_categoria: null,
        id_pagamento: null,
        valor: null,
        data_movimentacao: dataAtualISO(),
        id_responsavel: null,
        id_recebedor: null,
        id_banco: null,
        id_banco_recebedor: null,
        id_rotulo: null,
        descricao: '',
    }
}

// ---------- WATCHES ----------
// Ao abrir o dialog, popular o formulário
watch(
    () => props.modelValue,
    (novoValor) => {
        if (!novoValor) return

        if (props.movimentacaoParaEditar) {
            // Modo edição
            form.value = {
                id_categoria: props.movimentacaoParaEditar.id_categoria,
                id_pagamento: props.movimentacaoParaEditar.id_pagamento,
                valor: parseFloat(props.movimentacaoParaEditar.valor) || null,
                data_movimentacao:
                    props.movimentacaoParaEditar.data_movimentacao?.slice(0, 10) ||
                    dataAtualISO(),
                id_responsavel: props.movimentacaoParaEditar.id_responsavel,
                id_recebedor: props.movimentacaoParaEditar.id_recebedor,
                id_banco: props.movimentacaoParaEditar.id_banco,
                id_banco_recebedor: props.movimentacaoParaEditar.id_banco_recebedor,
                id_rotulo: props.movimentacaoParaEditar.id_rotulo,
                descricao: props.movimentacaoParaEditar.descricao || '',
            }
        } else {
            // Modo criação
            form.value = formInicial()
            if (euMesmo.value) {
                form.value.id_responsavel = euMesmo.value.id
                form.value.id_recebedor = euMesmo.value.id
            }
        }
        erroGeral.value = null
    }
)

// Se "Eu mesmo" carregar depois, preencher (apenas em criação)
watch(euMesmo, (novoEuMesmo) => {
    if (novoEuMesmo && !props.movimentacaoParaEditar && props.modelValue) {
        if (!form.value.id_responsavel) {
            form.value.id_responsavel = novoEuMesmo.id
        }
        if (!form.value.id_recebedor) {
            form.value.id_recebedor = novoEuMesmo.id
        }
    }
})

// ---------- HANDLERS ----------
function onCategoriaChange() {
    if (!categoriaSelecionada.value) return

    // Limpar banco destino se a nova categoria não precisa
    if (!mostrarBancoDestino.value) {
        form.value.id_banco_recebedor = null
    }

    // Transferência Interna: força débito/pix e preenche responsável/recebedor
    if (isTransferenciaInterna.value) {
        form.value.id_pagamento = 2 // Débito/PIX
        if (euMesmo.value) {
            form.value.id_responsavel = euMesmo.value.id
            form.value.id_recebedor = euMesmo.value.id
        }
    }

    // Recebimento: recebedor fixo = usuário; responsável = quem enviou
    if (isRecebimento.value) {
        if (euMesmo.value) {
            form.value.id_recebedor = euMesmo.value.id
        }
        // Se responsável ainda é "Eu mesmo", limpar para o usuário escolher o remetente
        if (
            euMesmo.value &&
            form.value.id_responsavel === euMesmo.value.id
        ) {
            form.value.id_responsavel = null
        }
    }

    // Pagamento de Fatura: responsável padrão = usuário
    if (isPagamentoFatura.value) {
        if (euMesmo.value && !form.value.id_responsavel) {
            form.value.id_responsavel = euMesmo.value.id
        }
    }
}

function onPagamentoChange() {
    // Dinheiro não tem banco origem
    if (form.value.id_pagamento === 3) {
        form.value.id_banco = null
    }
}

function fechar() {
    aberto.value = false
}

async function salvar() {
    if (!formValido.value) return

    salvando.value = true
    erroGeral.value = null

    try {
        const payload = {
            id_categoria: form.value.id_categoria,
            id_pagamento: form.value.id_pagamento,
            valor: parseFloat(form.value.valor),
            data_movimentacao: form.value.data_movimentacao,
            id_responsavel: form.value.id_responsavel,
            id_recebedor: form.value.id_recebedor || null,
            id_banco: form.value.id_banco || null,
            id_banco_recebedor: form.value.id_banco_recebedor || null,
            id_rotulo: form.value.id_rotulo || null,
            descricao: form.value.descricao || null,
        }

        if (isEdicao.value) {
            await api.put(`/movimentacoes/${props.movimentacaoParaEditar.id}`, payload)
        } else {
            await api.post('/movimentacoes', payload)
        }

        emit('salvo')
        fechar()
    } catch (error) {
        console.error('Erro ao salvar movimentação:', error)
        erroGeral.value =
            error.response?.data?.erro ||
            error.response?.data?.detalhes?.[0]?.mensagem ||
            error.message ||
            'Erro ao salvar movimentação'
    } finally {
        salvando.value = false
    }
}
</script>