import { MovimentacaoEstoque } from "../../Entities/Estoque/MovimentacaoEstoque";

export interface IMovimentacaoEstoqueRepository {
    createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<void>;
    listaMovimentacoes(): Promise<MovimentacaoEstoque[]>;
}