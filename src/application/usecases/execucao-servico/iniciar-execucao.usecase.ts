import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent, BusinessReason } from '../../observability/business-events';

export class IniciarExecucaoUseCase {
    constructor(
        private readonly execucaoServicoGateway: IExecucaoServicoGateway,
        private readonly ordemServicoGateway: IOrdemServicoGateway,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(id: string): Promise<ExecucaoServico> {
        const execucao = await this.execucaoServicoGateway.findById(id);

        if (!execucao) {
            throw new Error(`Execução não encontrada para o id ${id}.`);
        }

        execucao.iniciar();

        const ordem = await this.ordemServicoGateway.findById(execucao.ordemServicoId);

        if (!ordem) {
            throw new Error(
                `Ordem de serviço não encontrada para o id ${execucao.ordemServicoId}.`
            );
        }

        if (ordem.status.value !== StatusOSValues.EM_EXECUCAO) {
            this.observability.emit({
                msg: BusinessEvent.osProcessingFailed,
                alert: true,
                reason: BusinessReason.execucaoOsNotInExecution,
                ordemServicoId: execucao.ordemServicoId,
                execucaoId: id,
            });
            throw new Error(
                'Não é possível iniciar a execução de um serviço se a Ordem de Serviço não estiver em execução.'
            );
        }

        const atualizado = await this.execucaoServicoGateway.update(id, {
            status: execucao.status,
            iniciadoEm: execucao.iniciadoEm,
        });

        if (!atualizado) {
            throw new Error('Falha ao iniciar a execução.');
        }

        this.observability.emit({
            msg: BusinessEvent.execucaoStarted,
            execucaoId: atualizado.id ?? id,
            ordemServicoId: atualizado.ordemServicoId,
        });

        return atualizado;
    }
}
