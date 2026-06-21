import { RegistrarMovimentacaoInputDto } from '../../dtos/estoque/estoque.dtos';
import { MovimentacaoEstoque } from '../../../enterprise/entities/movimentacao-estoque.entity';
import { Estoque } from '../../../enterprise/entities/estoque.entity';
import { PecaId } from '../../../enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../../enterprise/value-objects/quantidade.vo';
import { TipoMovimentacao } from '../../../enterprise/value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../../../enterprise/value-objects/origem-movimentacao.vo';
import { IEstoqueGateway } from '../../ports/estoque.gateway.port';
import { IMovimentacaoEstoqueGateway } from '../../ports/movimentacao-estoque.gateway.port';
import { IPecaGateway } from '../../ports/peca.gateway.port';

export class RegistrarMovimentacaoEstoqueUseCase {
    constructor(
        private readonly estoqueGateway: IEstoqueGateway,
        private readonly movimentacaoGateway: IMovimentacaoEstoqueGateway,
        private readonly pecaGateway: IPecaGateway
    ) {}

    async execute(input: RegistrarMovimentacaoInputDto): Promise<MovimentacaoEstoque> {
        try {
            const pecaId = PecaId.from(input.pecaId);
            const peca = await this.pecaGateway.findById(pecaId.value);

            if (!peca) {
                throw new Error('Peça não encontrada para a movimentação de estoque');
            }

            const tipo = TipoMovimentacao.from(input.tipo);
            const quantidade = Quantidade.from(input.quantidade);
            const origem = OrigemMovimentacao.from(input.origem);

            const estoqueAtual =
                (await this.estoqueGateway.findByPecaId(pecaId.value)) ??
                Estoque.inicial(pecaId);

            const { estoque, movimentacao } = estoqueAtual.registrarMovimentacao({
                tipo,
                quantidade,
                data: input.data,
                origem,
            });

            // TODO: wrap in Mongo transaction when replica set is available
            await this.estoqueGateway.save(estoque);
            return await this.movimentacaoGateway.save(movimentacao);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    }
}
