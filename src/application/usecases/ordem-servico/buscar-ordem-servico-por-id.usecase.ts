import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';

export class BuscarOrdemServicoPorIdUseCase {
    constructor(private readonly ordemServicoGateway: IOrdemServicoGateway) {}

    async execute(id: string): Promise<OrdemServico | null> {
        return this.ordemServicoGateway.findById(id);
    }
}
