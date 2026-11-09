<!-- src/components/dashboard/CardsResumo.vue -->
<template>
    <v-row class="mb-4">
        <!-- Card de Entradas -->
        <v-col cols="12" sm="4">
            <v-card color="green-lighten-5" variant="tonal" rounded="lg" class="d-flex flex-column h-100">
                <v-card-text class="text-center pa-4">
                    <div class="d-flex align-center justify-center mb-2">
                        <v-icon color="green-darken-2" size="28" class="mr-2">mdi-cash-plus</v-icon>
                        <span class="text-subtitle1 font-weight-medium text-green-darken-2">
                            Entradas
                        </span>
                    </div>
                    <div class="text-h5 text-sm-h4 font-weight-bold text-green-darken-2">
                        {{ formatarMoeda(totalEntradas) }}
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Card de Saídas -->
        <v-col cols="12" sm="4">
            <v-card color="red-lighten-5" variant="tonal" rounded="lg" class="d-flex flex-column h-100">
                <v-card-text class="text-center pa-4">
                    <div class="d-flex align-center justify-center mb-2">
                        <v-icon color="red-darken-2" size="28" class="mr-2">mdi-cash-minus</v-icon>
                        <span class="text-subtitle1 font-weight-medium text-red-darken-2">
                            Saídas
                        </span>
                    </div>
                    <div class="text-h5 text-sm-h4 font-weight-bold text-red-darken-2">
                        {{ formatarMoeda(totalSaidas) }}
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Card de Saldo -->
        <v-col cols="12" sm="4">
            <v-card :color="saldoColor" variant="tonal" rounded="lg" class="d-flex flex-column h-100">
                <v-card-text class="text-center pa-4">
                    <div class="d-flex align-center justify-center mb-2">
                        <v-icon :color="saldoIconColor" size="28" class="mr-2">mdi-scale-balance</v-icon>
                        <span class="text-subtitle1 font-weight-medium" :class="saldoTextClass">
                            Saldo
                        </span>
                    </div>
                    <div class="text-h5 text-sm-h4 font-weight-bold" :class="saldoTextClass">
                        {{ formatarMoeda(saldo) }}
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { formatarMoeda } from '@/utils/formatUtils'

const props = defineProps({
    movimentacoes: {
        type: Array,
        required: true,
        default: () => []
    }
})

// Total de entradas (baseado no tipo_operacao da categoria)
const totalEntradas = computed(() => {
    return props.movimentacoes
        .filter(m => m.tipo_operacao === 'ENTRADA')
        .reduce((acc, m) => acc + parseFloat(m.valor || 0), 0)
})

// Total de saídas (baseado no tipo_operacao da categoria)
const totalSaidas = computed(() => {
    return props.movimentacoes
        .filter(m => m.tipo_operacao === 'SAIDA')
        .reduce((acc, m) => acc + parseFloat(m.valor || 0), 0)
})

// Saldo = entradas - saídas
const saldo = computed(() => totalEntradas.value - totalSaidas.value)

// Cor do card de saldo (verde se positivo, vermelho se negativo, cinza se zero)
const saldoColor = computed(() => {
    if (saldo.value > 0) return 'green-lighten-5'
    if (saldo.value < 0) return 'red-lighten-5'
    return 'grey-lighten-3'
})

// Classes de texto para o saldo
const saldoTextClass = computed(() => {
    if (saldo.value > 0) return 'text-green-darken-2'
    if (saldo.value < 0) return 'text-red-darken-2'
    return 'text-grey-darken-2'
})

// Cor do ícone do saldo
const saldoIconColor = computed(() => {
    if (saldo.value > 0) return 'green-darken-2'
    if (saldo.value < 0) return 'red-darken-2'
    return 'grey-darken-2'
})
</script>

<style scoped>
.h-100 {
    height: 100%;
}
</style>