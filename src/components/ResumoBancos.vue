<template>
  <v-row class="mb-6">
    <v-col
      v-for="banco in resumo"
      :key="banco.banco_id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      class="d-flex"
    >
      <v-card outlined class="flex-grow-1 d-flex flex-column">
        <v-card-title class="text-h6">🏦 {{ banco.banco_nome }}</v-card-title>
        <v-card-text class="flex-grow-1">
          <v-row>
            <v-col cols="6">
              <div class="text-subtitle-2 font-weight-medium">Conta Corrente</div>
              <div>
                <span class="text-green">+ {{ formatarMoeda(banco.conta_entradas, false) }}</span>
              </div>
              <div>
                <span class="text-red">- {{ formatarMoeda(banco.conta_saidas, false) }}</span>
              </div>
              <div>
                <strong :class="banco.conta_saldo >= 0 ? 'text-green-darken-2' : 'text-red-darken-2'">
                  Saldo: {{ formatarMoeda(banco.conta_saldo, false) }}
                </strong>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 font-weight-medium">Cartão de Crédito</div>
              <div>
                <span class="text-green">+ {{ formatarMoeda(banco.cartao_entradas, false) }}</span>
              </div>
              <div>
                <span class="text-red">- {{ formatarMoeda(banco.cartao_saidas, false) }}</span>
              </div>
              <div>
                <strong class="text-orange-darken-2">
                  Utilizado: {{ formatarMoeda(banco.cartao_utilizado, false) }}
                </strong>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" v-if="resumo.length === 0">
      <v-alert type="info" class="ma-4">
        Nenhum banco com movimentações no período.
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { formatarMoeda } from '../utils/formatUtils'

const props = defineProps({
  movimentacoes: {
    type: Array,
    required: true,
    default: () => []
  },
  bancos: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Mapeia os bancos por ID para acesso rápido
const bancosMap = computed(() => {
  const map = {}
  props.bancos.forEach(b => {
    map[b.id] = b.nome
  })
  return map
})

// Calcula o resumo por banco
const resumo = computed(() => {
  const items = props.movimentacoes
  if (!items.length || !props.bancos.length) return []

  // Inicializa estrutura por banco
  const mapa = {}
  props.bancos.forEach(b => {
    mapa[b.id] = {
      banco_id: b.id,
      banco_nome: b.nome,
      conta_entradas: 0,
      conta_saidas: 0,
      cartao_entradas: 0,
      cartao_saidas: 0
    }
  })

  for (const mov of items) {
    const valor = parseFloat(mov.valor) || 0
    const tipo = mov.tipo_operacao
    const pagamento = mov.id_pagamento
    const categoria = mov.categoria_nome

    // Ignorar transferências internas
    if (tipo === 'TRANSFERENCIA') continue

    // ENTRADA
    if (tipo === 'ENTRADA') {
      const bancoDestino = mov.id_banco_recebedor
      if (bancoDestino && mapa[bancoDestino]) {
        mapa[bancoDestino].conta_entradas += valor
      }
      continue
    }

    // SAIDA
    if (tipo === 'SAIDA') {
      const bancoOrigem = mov.id_banco
      const bancoDestino = mov.id_banco_recebedor
      const isFatura = categoria === 'Pagamento de Fatura'

      if (pagamento === 1) { // Cartão de crédito
        if (!isFatura) {
          if (bancoOrigem && mapa[bancoOrigem]) {
            mapa[bancoOrigem].cartao_saidas += valor
          }
        }
        // Se for fatura com cartão, não tratamos (não permitido)
      } else { // Débito/PIX ou Dinheiro
        if (isFatura) {
          // Pagamento de fatura: sai da conta origem e restaura limite do cartão destino
          if (bancoOrigem && mapa[bancoOrigem]) {
            mapa[bancoOrigem].conta_saidas += valor
          }
          if (bancoDestino && mapa[bancoDestino]) {
            mapa[bancoDestino].cartao_entradas += valor
          }
        } else {
          // Pagamento normal (compra, conta, etc.) → sai da conta origem
          if (bancoOrigem && mapa[bancoOrigem]) {
            mapa[bancoOrigem].conta_saidas += valor
          }
        }
      }
    }
  }

  // Calcular saldos e retornar apenas bancos com movimentação
  const resultado = Object.values(mapa)
    .map(b => {
      b.conta_saldo = b.conta_entradas - b.conta_saidas
      b.cartao_utilizado = b.cartao_saidas - b.cartao_entradas
      return b
    })
    .filter(b => {
      // Inclui apenas bancos que tiveram pelo menos uma movimentação
      return b.conta_entradas > 0 || b.conta_saidas > 0 ||
             b.cartao_entradas > 0 || b.cartao_saidas > 0
    })

  return resultado
})
</script>

<style scoped>
.text-green {
  color: #2e7d32;
}
.text-red {
  color: #c62828;
}
.text-green-darken-2 {
  color: #1b5e20;
}
.text-red-darken-2 {
  color: #b71c1c;
}
.text-orange-darken-2 {
  color: #e65100;
}
</style>