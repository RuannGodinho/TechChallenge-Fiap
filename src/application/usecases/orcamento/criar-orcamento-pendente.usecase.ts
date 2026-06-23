import { CriarOrcamentoPendenteInputDto } from '../../dtos/orcamento/orcamento.dtos';
import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { Peca } from '../../../enterprise/entities/peca.entity';
import { Servico } from '../../../enterprise/entities/servico.entity';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';

export class CriarOrcamentoPendenteUseCase {
    constructor(private readonly orcamentoGateway: IOrcamentoGateway) {}

    async execute(input: CriarOrcamentoPendenteInputDto): Promise<void> {
        const pecas = input.pecas.map(
            (item) =>
                new Peca(
                    item.nome,
                    item.descricao,
                    item.preco,
                    item.tipo as Peca['tipo'],
                    item.id,
                    item.quantidade
                )
        );

        const servicos = input.servicos.map(
            (item) => new Servico(item.nome, item.descricao, item.preco, item.id)
        );

        const orcamento = Orcamento.createPendente({
            ordemServicoId: input.ordemServicoId,
            pecas,
            servicos,
            valorTotal: input.valorTotal,
        });

        await this.orcamentoGateway.save(orcamento);
    }
}
