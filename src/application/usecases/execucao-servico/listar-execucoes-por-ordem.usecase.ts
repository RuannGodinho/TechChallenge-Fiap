import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';

export class ListarExecucoesPorOrdemUseCase {
    constructor(private readonly execucaoServicoGateway: IExecucaoServicoGateway) {}

    async execute(ordemServicoId: string): Promise<ExecucaoServico[]> {
        return this.execucaoServicoGateway.findByOrdemServicoId(ordemServicoId);
    }
}
