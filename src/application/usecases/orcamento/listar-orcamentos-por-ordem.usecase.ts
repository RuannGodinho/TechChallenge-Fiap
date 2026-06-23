import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';

export class ListarOrcamentosPorOrdemUseCase {
    constructor(private readonly orcamentoGateway: IOrcamentoGateway) {}

    async execute(ordemServicoId: string): Promise<Orcamento[]> {
        return this.orcamentoGateway.findByOrdemServicoId(ordemServicoId);
    }
}
