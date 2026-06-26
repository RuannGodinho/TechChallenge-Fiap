import { AtualizarOrcamentoInputDto } from '../../dtos/orcamento/orcamento.dtos';
import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';

export class AtualizarOrcamentoUseCase {
    constructor(private readonly orcamentoGateway: IOrcamentoGateway) {}

    async execute(id: string, input: AtualizarOrcamentoInputDto): Promise<Orcamento | null> {
        const existing = await this.orcamentoGateway.findById(id);

        if (!existing) {
            return null;
        }

        existing.aplicarAtualizacao(input);
        return this.orcamentoGateway.update(id, existing);
    }
}
