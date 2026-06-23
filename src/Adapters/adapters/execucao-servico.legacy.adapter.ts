import { IExecucaoServicoPort } from '../../application/ports/execucao-servico.port';
import { IExecucaoServicoService } from '../../Interfaces/ExecucaoServico/execucao-servico-service.interface';

export class ExecucaoServicoLegacyAdapter implements IExecucaoServicoPort {
    constructor(private readonly execucaoServicoService: IExecucaoServicoService) {}

    async createExecucoesParaServicos(
        ordemServicoId: string,
        servicoIds: string[]
    ): Promise<void> {
        await this.execucaoServicoService.createExecucoesParaServicos(ordemServicoId, servicoIds);
    }
}
