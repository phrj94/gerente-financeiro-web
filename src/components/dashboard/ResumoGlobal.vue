<template>
  <v-row class="mb-4">
    <!-- Bloco Conta Corrente Global -->
    <v-col cols="12" md="6">
      <v-card variant="outlined" rounded="lg" class="h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold bg-blue-lighten-5">
          🏦 Saldo em Contas Correntes
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="4" class="text-center">
              <div class="text-caption text-medium-emphasis">Entradas (Ext.)</div>
              <div class="text-h6 text-green-darken-2">{{ formatarMoeda(conta.entradas) }}</div>
            </v-col>
            <v-col cols="4" class="text-center" style="border-left: 1px solid #eee; border-right: 1px solid #eee;">
              <div class="text-caption text-medium-emphasis">Saídas (Ext.)</div>
              <div class="text-h6 text-red-darken-2">{{ formatarMoeda(conta.saidas) }}</div>
            </v-col>
            <v-col cols="4" class="text-center">
              <div class="text-caption text-medium-emphasis">Saldo</div>
              <div class="text-h6" :class="conta.saldo >= 0 ? 'text-green-darken-2' : 'text-red-darken-2'">
                {{ formatarMoeda(conta.saldo) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Bloco Cartão Global -->
    <v-col cols="12" md="6">
      <v-card variant="outlined" rounded="lg" class="h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold bg-purple-lighten-5">
          💳 Cartões de Crédito
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="4" class="text-center">
              <div class="text-caption text-medium-emphasis">Compras</div>
              <div class="text-h6 text-blue-darken-2">{{ formatarMoeda(cartao.compras) }}</div>
            </v-col>
            <v-col cols="4" class="text-center" style="border-left: 1px solid #eee; border-right: 1px solid #eee;">
              <div class="text-caption text-medium-emphasis">Faturas Pagas</div>
              <div class="text-h6 text-teal-darken-2">{{ formatarMoeda(cartao.pagamentos) }}</div>
            </v-col>
            <v-col cols="4" class="text-center">
              <div class="text-caption text-medium-emphasis">Fatura em Aberto</div>
              <div class="text-h6 text-orange-darken-2">{{ formatarMoeda(cartao.fatura) }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { formatarMoeda } from '@/utils/formatUtils'

const props = defineProps({
  movimentacoes: { type: Array, required: true, default: () => [] }
})

// Conta Corrente: Apenas o que não é cartão. Ignora transferências para não inflar o fluxo.
const conta = computed(() => {
  let entradas = 0
  let saidas = 0

  props.movimentacoes.forEach(mov => {
    if (mov.id_pagamento !== 1) {
      const valor = parseFloat(mov.valor) || 0
      if (mov.tipo_operacao === 'ENTRADA') entradas += valor
      else if (mov.tipo_operacao === 'SAIDA') saidas += valor
    }
  })

  return { entradas, saidas, saldo: entradas - saidas }
})

// Cartão: Compras e Pagamentos de Fatura
const cartao = computed(() => {
  let compras = 0
  let pagamentos = 0

  props.movimentacoes.forEach(mov => {
    const valor = parseFloat(mov.valor) || 0
    
    // Compras (Saídas no cartão)
    if (mov.id_pagamento === 1 && mov.tipo_operacao === 'SAIDA') {
      compras += valor
    }
    
    // Pagamentos de Fatura
    if (mov.categoria_nome === 'Pagamento de Fatura') {
      pagamentos += valor
    }
  })

  return { 
    compras, 
    pagamentos, 
    fatura: Math.max(compras - pagamentos, 0) 
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>