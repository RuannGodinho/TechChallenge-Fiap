import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';

export class SalvarOrcamentoUseCase {
    constructor(private readonly orcamentoGateway: IOrcamentoGateway) {}

    async execute(orcamento: Orcamento): Promise<Orcamento> {
        return this.orcamentoGateway.save(orcamento);
    }
}
