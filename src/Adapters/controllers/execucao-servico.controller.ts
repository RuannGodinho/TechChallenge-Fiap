import {
    ExecucaoServicoResponseDto,
    TempoMedioServicosResponseDto,
} from '../../application/dtos/execucao-servico/execucao-servico.dtos';
import { IniciarExecucaoUseCase } from '../../application/usecases/execucao-servico/iniciar-execucao.usecase';
import { FinalizarExecucaoUseCase } from '../../application/usecases/execucao-servico/finalizar-execucao.usecase';
import { ListarExecucoesPorOrdemUseCase } from '../../application/usecases/execucao-servico/listar-execucoes-por-ordem.usecase';
import { ObterTempoMedioServicosUseCase } from '../../application/usecases/execucao-servico/obter-tempo-medio-servicos.usecase';
import { ExecucaoServicoPresenter } from '../presenters/execucao-servico.presenter';

type UseCaseFactory<T> = () => T;

export class ExecucaoServicoController {
    constructor(
        private readonly getListarExecucoesPorOrdemUseCase: UseCaseFactory<ListarExecucoesPorOrdemUseCase>,
        private readonly getIniciarExecucaoUseCase: UseCaseFactory<IniciarExecucaoUseCase>,
        private readonly getFinalizarExecucaoUseCase: UseCaseFactory<FinalizarExecucaoUseCase>,
        private readonly getObterTempoMedioServicosUseCase: UseCaseFactory<ObterTempoMedioServicosUseCase>,
        private readonly getPresenter: UseCaseFactory<ExecucaoServicoPresenter>
    ) {}

    async getExecucoesByOrdemServicoId(
        ordemServicoId: string
    ): Promise<ExecucaoServicoResponseDto[]> {
        const execucoes = await this.getListarExecucoesPorOrdemUseCase().execute(ordemServicoId);
        return this.getPresenter().presentList(execucoes);
    }

    async iniciarExecucao(id: string): Promise<ExecucaoServicoResponseDto> {
        const execucao = await this.getIniciarExecucaoUseCase().execute(id);
        return this.getPresenter().present(execucao);
    }

    async finalizarExecucao(id: string): Promise<ExecucaoServicoResponseDto> {
        const execucao = await this.getFinalizarExecucaoUseCase().execute(id);
        return this.getPresenter().present(execucao);
    }

    async getTempoMedioServicos(): Promise<TempoMedioServicosResponseDto> {
        return this.getObterTempoMedioServicosUseCase().execute();
    }
}
