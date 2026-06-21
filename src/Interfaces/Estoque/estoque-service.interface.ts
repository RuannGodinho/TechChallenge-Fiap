import { ObjectId } from 'mongodb';
import { Estoque } from '../../Entities/Estoque/estoque';
import { MovimentacaoEstoque } from '../../Entities/Estoque/movimentacao-estoque';

export interface IEstoqueService {
    getAllEstoque(): Promise<Estoque[]>;
    createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque>;
    listaMovimentacoes(): Promise<MovimentacaoEstoque[]>;
    getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null>;
}
