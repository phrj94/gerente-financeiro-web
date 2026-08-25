/**
 * Formata um número para o padrão brasileiro (R$)
 * @param {number|string} valor - Valor a ser formatado
 * @param {boolean} showSymbol - Se deve exibir o símbolo R$
 * @returns {string} Valor formatado (ex: R$ 1.234,56 ou 1.234,56)
 */
export function formatarMoeda(valor, showSymbol = true) {
  if (valor === undefined || valor === null || isNaN(parseFloat(valor))) {
    return showSymbol ? 'R$ 0,00' : '0,00'
  }
  
  const numero = parseFloat(valor)
  const formatado = numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return showSymbol ? `R$ ${formatado}` : formatado
}

/**
 * Formata um número para o padrão brasileiro sem símbolo
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} Valor formatado (ex: 1.234,56)
 */
export function formatarNumero(valor) {
  if (valor === undefined || valor === null || isNaN(parseFloat(valor))) {
    return '0,00'
  }
  
  return parseFloat(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}