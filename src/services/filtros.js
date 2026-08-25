
const filtrarMovimentacao = (movimentacoes, filtros) => {

}

const filtrarRotulo = (movimentacoes, rotulo) => {
    movimentacoes.filter(movimentacao => movimentacao.rotulo.id === rotulo.id)
}

const filtrarCategoria = (movimentacoes, categoria) => {
    movimentacoes.filter(movimentacao => movimentacao.categoria.id === categoria.id)
}

const filtrarFormaPagamento = (movimentacoes, formaPagamento) => {
    movimentacoes.filter(movimentacao => movimentacao.formaPagamento.id === formaPagamento.id)
}

const filtrarResponsavel = (movimentacoes, responsavel) => {
    movimentacoes.filter(movimentacao => movimentacao.responsavel.id === responsavel.id)
}

const filtrarRecebedor = (movimentacoes, recebedor) => {
    movimentacoes.filter(movimentacao => movimentacao.recebedor.id === recebedor.id)
}

const filtrarBancoOrigem = (movimentacoes, bancoOrigem) => {
    movimentacoes.filter(movimentacao => movimentacao.bancoOrigem.id === bancoOrigem.id)
}

const filtrarBancoDestino = (movimentacoes, bancoDestino) => {
    movimentacoes.filter(movimentacao => movimentacao.bancoDestino.id === bancoDestino.id)
}

const filtrarValor = (movimentacoes, categoria) => {
    movimentacoes.filter(movimentacao => movimentacao.categoria.id === categoria.id)
}

const filtrarDescricao = (movimentacoes, categoria) => {
    movimentacoes.filter(movimentacao => movimentacao.categoria.id === categoria.id)
}