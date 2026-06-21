import { MovimentacaoEstoque } from '../../enterprise/entities/movimentacao-estoque.entity';

export interface IMovimentacaoEstoqueGateway {
    findAll(): Promise<MovimentacaoEstoque[]>;
    save(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque>;
}
