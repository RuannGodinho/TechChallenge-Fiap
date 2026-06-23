import { IEstoqueMovimentacaoPort } from '../../application/ports/estoque-movimentacao.port';
import { BuscarEstoquePorPecaIdUseCase } from '../../application/usecases/estoque/buscar-estoque-por-peca-id.usecase';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../application/usecases/estoque/registrar-movimentacao-estoque.usecase';

export class EstoqueMovimentacaoAdapter implements IEstoqueMovimentacaoPort {
    constructor(
        private readonly buscarEstoquePorPecaIdUseCase: BuscarEstoquePorPecaIdUseCase,
        private readonly registrarMovimentacaoEstoqueUseCase: RegistrarMovimentacaoEstoqueUseCase
    ) {}

    async assertQuantidadeDisponivel(pecaId: string, quantidade: number): Promise<void> {
        const estoque = await this.buscarEstoquePorPecaIdUseCase.execute(pecaId);

        if (!estoque || estoque.quantidade.isZero()) {
            throw new Error(`Não há estoque para a peça ${pecaId}`);
        }

        if (estoque.quantidade.value < quantidade) {
            throw new Error(`Quantidade insuficiente em estoque para a peça ${pecaId}`);
        }
    }

    async registrarSaidaOS(pecaId: string, quantidade: number): Promise<void> {
        await this.registrarMovimentacaoEstoqueUseCase.execute({
            pecaId,
            tipo: 'SAIDA',
            quantidade,
            origem: 'OS',
            data: new Date(),
        });
    }
}
