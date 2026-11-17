<template>
  <v-card variant="outlined" rounded="lg" class="mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold bg-grey-lighten-4">
      🏦 Resumo por Banco
    </v-card-title>

    <v-card-text v-if="resumo.length === 0" class="text-center text-medium-emphasis py-4">
      Nenhuma movimentação registrada para os bancos neste período.
    </v-card-text>

    <v-expansion-panels v-else variant="accordion" flat>
      <v-expansion-panel v-for="banco in resumo" :key="banco.banco_id">
        <!-- Cabeçalho do Painel (Sempre visível) -->
        <v-expansion-panel-title>
          <v-row class="align-center w-100">
            <v-col cols="12" sm="4" class="font-weight-bold">
              {{ banco.banco_nome }}
            </v-col>
            <v-col cols="12" sm="4" class="text-sm-center text-caption">
              Saldo Conta: 
              <strong :class="banco.conta_saldo >= 0 ? 'text-green-darken-2' : 'text-red-darken-2'">
                {{ formatarMoeda(banco.conta_saldo) }}
              </strong>
            </v-col>
            <v-col cols="12" sm="4" class="text-sm-end text-caption">
              Fatura Aberta: 
              <strong class="text-orange-darken-2">
                {{ formatarMoeda(banco.cartao_fatura) }}
              </strong>
            </v-col>
          </v-row>
        </v-expansion-panel-title>

        <!-- Conteúdo Expandido -->
        <v-expansion-panel-text>
          <v-row>
            <!-- Detalhes Conta Corrente -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 font-weight-bold mb-2">Conta Corrente</div>
              <v-list density="compact" class="bg-grey-lighten-5 rounded">
                <v-list-item>
                  <v-list-item-title class="text-green-darken-2">Entradas</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.conta_entradas) }}</template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="text-red-darken-2">Saídas</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.conta_saidas) }}</template>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item class="font-weight-bold">
                  <v-list-item-title>Saldo</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.conta_saldo) }}</template>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- Detalhes Cartão -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 font-weight-bold mb-2">Cartão de Crédito</div>
              <v-list density="compact" class="bg-grey-lighten-5 rounded">
                <v-list-item>
                  <v-list-item-title class="text-blue-darken-2">Compras</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.cartao_compras) }}</template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="text-teal-darken-2">Faturas Pagas</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.cartao_pagamentos) }}</template>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item class="font-weight-bold">
                  <v-list-item-title>Fatura em Aberto</v-list-item-title>
                  <template v-slot:append>{{ formatarMoeda(banco.cartao_fatura) }}</template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatarMoeda } from '@/utils/formatUtils'

const props = defineProps({
  movimentacoes: { type: Array, required: true, default: () => [] },
  bancos: { type: Array, required: true, default: () => [] }
})

const resumo = computed(() => {
  const mapa = {}
  
  // Inicializa todos os bancos
  props.bancos.forEach(b => {
    mapa[b.id] = {
      banco_id: b.id,
      banco_nome: b.nome,
      conta_entradas: 0, 
      conta_saidas: 0,
      cartao_compras: 0, 
      cartao_pagamentos: 0
    }
  })

  props.movimentacoes.forEach(mov => {
    const valor = parseFloat(mov.valor) || 0

    // === CONTA CORRENTE ===
    if (mov.id_pagamento !== 1) {
      // Entradas na conta (inclui transferências recebidas)
      if (mov.id_banco_recebedor && mapa[mov.id_banco_recebedor]) {
        mapa[mov.id_banco_recebedor].conta_entradas += valor
      }
      // Saídas da conta (inclui transferências enviadas e pagamento de fatura)
      if (mov.id_banco && mapa[mov.id_banco]) {
        mapa[mov.id_banco].conta_saidas += valor
      }
    } 
    
    // === CARTÃO DE CRÉDITO ===
    else {
      // Compras no cartão
      if (mov.tipo_operacao === 'SAIDA' && mov.id_banco && mapa[mov.id_banco]) {
        mapa[mov.id_banco].cartao_compras += valor
      }
      // Pagamento de fatura (restaura limite)
      if (mov.categoria_nome === 'Pagamento de Fatura' && mov.id_banco_recebedor && mapa[mov.id_banco_recebedor]) {
        mapa[mov.id_banco_recebedor].cartao_pagamentos += valor
      }
    }
  })

  // Calcula os saldos e filtra apenas bancos que tiveram movimentação
  return Object.values(mapa)
    .map(b => ({
      ...b,
      conta_saldo: b.conta_entradas - b.conta_saidas,
      cartao_fatura: Math.max(b.cartao_compras - b.cartao_pagamentos, 0)
    }))
    .filter(b => 
      b.conta_entradas > 0 || b.conta_saidas > 0 || 
      b.cartao_compras > 0 || b.cartao_pagamentos > 0
    )
})
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>