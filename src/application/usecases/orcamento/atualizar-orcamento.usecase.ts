import { AtualizarOrcamentoInputDto } from '../../dtos/orcamento/orcamento.dtos';
import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent } from '../../observability/business-events';

export class AtualizarOrcamentoUseCase {
    constructor(
        private readonly orcamentoGateway: IOrcamentoGateway,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(id: string, input: AtualizarOrcamentoInputDto): Promise<Orcamento | null> {
        const existing = await this.orcamentoGateway.findById(id);

        if (!existing) {
            return null;
        }

        existing.aplicarAtualizacao(input);
        const updated = await this.orcamentoGateway.update(id, existing);

        if (updated && input.status) {
            this.observability.emit({
                msg: BusinessEvent.orcamentoStatusChanged,
                orcamentoId: updated.id ?? id,
                status: updated.status.value,
                ordemServicoId: updated.ordemServicoId,
            });
        }

        return updated;
    }
}
