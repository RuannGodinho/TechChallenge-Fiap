import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { StatusExecucaoValues } from '../../../enterprise/value-objects/status-execucao.vo';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent } from '../../observability/business-events';

export class FinalizarExecucaoUseCase {
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

        execucao.finalizar();

        const atualizado = await this.execucaoServicoGateway.update(id, {
            status: execucao.status,
            finalizadoEm: execucao.finalizadoEm,
        });

        if (!atualizado) {
            throw new Error('Falha ao finalizar a execução.');
        }

        this.observability.emit({
            msg: BusinessEvent.execucaoFinished,
            execucaoId: atualizado.id ?? id,
            ordemServicoId: atualizado.ordemServicoId,
        });

        await this.finalizarOrdemServicoSeNecessario(execucao.ordemServicoId);

        return atualizado;
    }

    private async finalizarOrdemServicoSeNecessario(ordemServicoId: string): Promise<void> {
        const execucoes = await this.execucaoServicoGateway.findByOrdemServicoId(ordemServicoId);
        const todasFinalizadas = execucoes.every(
            (execucao) => execucao.status.value === StatusExecucaoValues.FINALIZADO
        );

        if (todasFinalizadas && execucoes.length > 0) {
            const ordem = await this.ordemServicoGateway.findById(ordemServicoId);

            if (!ordem) {
                throw new Error(
                    `Ordem de serviço não encontrada para o id ${ordemServicoId}.`
                );
            }

            const transition = ordem.transicionarStatus(StatusOS.from(StatusOSValues.FINALIZADA));
            await this.ordemServicoGateway.update(ordemServicoId, ordem);

            this.observability.emit({
                msg: BusinessEvent.osAutoFinalized,
                ordemServicoId,
            });
            this.observability.emit({
                msg: BusinessEvent.osStatusChanged,
                ordemServicoId,
                from: transition.from,
                to: transition.to,
                durationMs: transition.durationMs,
            });
        }
    }
}
