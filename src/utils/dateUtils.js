// src/utils/dateUtils.js

export function dataAtualISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function dataAtrasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} Data formatada (ex: 15/01/2024) ou '-' se inválida
 */
export function formatarData(data) {
  if (!data) return '-'
  const d = new Date(data)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}