import { IExecucaoServicoPort } from '../../application/ports/execucao-servico.port';
import { CriarExecucoesParaServicosUseCase } from '../../application/usecases/execucao-servico/criar-execucoes-para-servicos.usecase';

export class ExecucaoServicoPortAdapter implements IExecucaoServicoPort {
    constructor(
        private readonly criarExecucoesParaServicosUseCase: CriarExecucoesParaServicosUseCase
    ) {}

    async createExecucoesParaServicos(
        ordemServicoId: string,
        servicoIds: string[]
    ): Promise<void> {
        await this.criarExecucoesParaServicosUseCase.execute({ ordemServicoId, servicoIds });
    }
}
