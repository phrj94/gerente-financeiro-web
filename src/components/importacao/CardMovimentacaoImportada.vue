<template>
    <v-card class="mb-3" variant="outlined" :class="{ 'border-error': temErro }">
        <!-- Cabeçalho do card (sempre visível) -->
        <div class="d-flex align-center pa-3" style="cursor: pointer;" @click="aberto = !aberto">
            <v-checkbox :model-value="selecionado" @update:model-value="$emit('toggle-selecionado', movimentacaoIndex)"
                @click.stop density="compact" hide-details class="mr-2" />

            <v-chip :color="movimentacao.tipo_sugerido === 'ENTRADA' ? 'green' : 'red'" size="small" variant="flat" class="mr-3">
                {{ movimentacao.tipo_sugerido === 'ENTRADA' ? '+' : '-' }} R$ {{ formatarMoeda(movimentacao.valor, false) }}
            </v-chip>

            <div class="flex-grow-1">
                <div class="font-weight-medium text-body-1">
                    {{ form.descricao || 'Sem descrição' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                    {{ formatarData(movimentacao.data_movimentacao) }}
                    · {{ form.categoria_nome || 'Sem categoria' }}
                    <span v-if="form.rotulo_nome"> · {{ form.rotulo_nome }}</span>
                </div>
            </div>

            <!-- Badge de avisos -->
            <v-chip v-if="movimentacao.avisos?.length" color="warning" size="x-small" variant="tonal" class="mr-2">
                <v-icon start size="x-small">mdi-alert</v-icon>
                {{ movimentacao.avisos.length }}
            </v-chip>

            <!-- Status de salvamento -->
            <v-chip v-if="status === 'salvo'" color="success" size="x-small" variant="flat" class="mr-2">
                Salvo
            </v-chip>
            <v-chip v-if="status === 'erro'" color="error" size="x-small" variant="flat" class="mr-2">
                Erro
            </v-chip>

            <v-btn icon variant="text" size="small" @click.stop="aberto = !aberto">
                <v-icon>{{ aberto ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </div>

        <!-- Corpo do card (expansível) -->
        <v-expand-transition>
            <div v-show="aberto">
                <v-divider />

                <v-card-text>
                    <!-- Avisos -->
                    <v-alert v-if="movimentacao.avisos?.length" type="warning" variant="tonal" density="compact" class="mb-3">
                        <div v-for="(aviso, i) in movimentacao.avisos" :key="i" class="text-caption">
                            • {{ aviso }}
                        </div>
                    </v-alert>

                    <!-- Formulário de edição -->
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_categoria" :items="categorias" item-title="nome" item-value="id"
                                label="Categoria" variant="outlined" density="compact" hide-details />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_pagamento" :items="formasPagamento" item-title="nome"
                                item-value="id" label="Forma de pagamento" variant="outlined" density="compact"
                                hide-details />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model.number="form.valor" label="Valor" type="number" step="0.01"
                                prefix="R$" variant="outlined" density="compact" hide-details />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model="form.data_movimentacao" label="Data" type="date" variant="outlined"
                                density="compact" hide-details />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_responsavel" :items="responsaveis" item-title="nome"
                                item-value="id" label="Responsável" variant="outlined" density="compact" hide-details
                                clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_recebedor" :items="recebedores" item-title="nome" item-value="id"
                                label="Recebedor" variant="outlined" density="compact" hide-details clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_banco" :items="bancos" item-title="nome" item-value="id"
                                label="Banco origem" variant="outlined" density="compact" hide-details clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_banco_recebedor" :items="bancos" item-title="nome"
                                item-value="id" label="Banco destino" variant="outlined" density="compact" hide-details
                                clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="form.id_rotulo" :items="rotulos" item-title="nome" item-value="id"
                                label="Rótulo" variant="outlined" density="compact" hide-details clearable />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field v-model="form.descricao" label="Descrição" variant="outlined"
                                density="compact" hide-details />
                        </v-col>
                    </v-row>

                    <!-- Linha do tempo (opcional, só informativa) -->
                    <div class="text-caption text-medium-emphasis mt-2">
                        Linha original no extrato: {{ movimentacao.linha_original }}
                        <span v-if="movimentacao.contraparte_nome"> · Contraparte: {{ movimentacao.contraparte_nome }}</span>
                    </div>
                </v-card-text>

                <v-divider />

                <v-card-actions>
                    <v-btn color="error" variant="text" size="small" prepend-icon="mdi-delete"
                        @click="$emit('deletar', movimentacaoIndex)" :disabled="status === 'salvo'">
                        Remover
                    </v-btn>
                    <v-spacer />
                    <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-content-save"
                        :loading="salvando" :disabled="status === 'salvo'" @click="salvarIndividual">
                        Salvar
                    </v-btn>
                </v-card-actions>
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import { formatarData } from '@/utils/dateUtils'
import { formatarMoeda } from '@/utils/formatUtils'

const props = defineProps({
    movimentacao: { type: Object, required: true },
    movimentacaoIndex: { type: Number, required: true },
    selecionado: { type: Boolean, default: false },
    status: { type: String, default: 'pendente' }, // 'pendente' | 'salvo' | 'erro'
    categorias: { type: Array, default: () => [] },
    formasPagamento: { type: Array, default: () => [] },
    responsaveis: { type: Array, default: () => [] },
    recebedores: { type: Array, default: () => [] },
    bancos: { type: Array, default: () => [] },
    rotulos: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-selecionado', 'deletar', 'salvo', 'alterou'])

const aberto = ref(false)
const salvando = ref(false)

// Form local (editável), copiado do payload inicial
const form = ref(payloadInicial())

const temErro = computed(() => props.status === 'erro')

function payloadInicial() {
    const m = props.movimentacao
    return {
        id_categoria: m.id_categoria_sugerido,
        id_pagamento: m.id_pagamento_sugerido,
        id_responsavel: m.id_responsavel_sugerido,
        id_recebedor: m.id_recebedor_sugerido,
        id_banco: m.id_banco_sugerido,
        id_banco_recebedor: m.id_banco_recebedor_sugerido,
        id_rotulo: m.id_rotulo_sugerido,
        valor: m.valor,
        data_movimentacao: m.data_movimentacao,
        descricao: m.descricao,
        // Para exibição no cabeçalho do card
        categoria_nome: m.categoria_nome_sugerido,
        rotulo_nome: m.rotulo_nome_sugerido,
    }
}

// Sempre que o form muda, expor para o pai via emit para cálculo de "tem alteração"
watch(form, (novo) => {
    emit('alterou', { index: props.movimentacaoIndex, dados: novo })
}, { deep: true })

async function salvarIndividual() {
    salvando.value = true
    try {
        await api.post('/extratos/confirmar', {
            movimentacoes: [{
                id_categoria: form.value.id_categoria,
                id_pagamento: form.value.id_pagamento,
                id_responsavel: form.value.id_responsavel,
                id_recebedor: form.value.id_recebedor,
                id_banco: form.value.id_banco,
                id_banco_recebedor: form.value.id_banco_recebedor,
                id_rotulo: form.value.id_rotulo,
                valor: parseFloat(form.value.valor),
                data_movimentacao: form.value.data_movimentacao,
                descricao: form.value.descricao,
            }],
        })
        emit('salvo', props.movimentacaoIndex)
    } catch (e) {
        console.error('Erro ao salvar movimentação:', e)
        alert(e.response?.data?.erro || 'Erro ao salvar movimentação')
    } finally {
        salvando.value = false
    }
}

// Expõe o form atual para o pai (usado no "Salvar todos")
defineExpose({
    getDados: () => ({ ...form.value }),
})
</script>

<style scoped>
.border-error {
    border-color: #F44336 !important;
    border-width: 2px !important;
}
</style>