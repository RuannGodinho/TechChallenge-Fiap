import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';

export class ListarOrdensServicoUseCase {
    constructor(private readonly ordemServicoGateway: IOrdemServicoGateway) {}

    async execute(): Promise<OrdemServico[]> {
        return this.ordemServicoGateway.findAll();
    }
}
