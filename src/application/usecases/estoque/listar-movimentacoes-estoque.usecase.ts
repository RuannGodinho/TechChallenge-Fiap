import { MovimentacaoEstoque } from '../../../enterprise/entities/movimentacao-estoque.entity';
import { IMovimentacaoEstoqueGateway } from '../../ports/movimentacao-estoque.gateway.port';

export class ListarMovimentacoesEstoqueUseCase {
    constructor(private readonly gateway: IMovimentacaoEstoqueGateway) {}

    async execute(): Promise<MovimentacaoEstoque[]> {
        return this.gateway.findAll();
    }
}
