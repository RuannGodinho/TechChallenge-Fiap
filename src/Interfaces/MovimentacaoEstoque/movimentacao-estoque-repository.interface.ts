import { MovimentacaoEstoque } from "../../Entities/Estoque/movimentacao-estoque";

export interface IMovimentacaoEstoqueRepository {
    createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<void>;
    listaMovimentacoes(): Promise<MovimentacaoEstoque[]>;
}