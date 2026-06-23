import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { StatusExecucaoValues } from '../../../enterprise/value-objects/status-execucao.vo';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';

export class FinalizarExecucaoUseCase {
    constructor(
        private readonly execucaoServicoGateway: IExecucaoServicoGateway,
        private readonly ordemServicoGateway: IOrdemServicoGateway
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

        await this.finalizarOrdemServicoSeNecessario(execucao.ordemServicoId);

        return atualizado;
    }

    private async finalizarOrdemServicoSeNecessario(ordemServicoId: string): Promise<void> {
        const execucoes = await this.execucaoServicoGateway.findByOrdemServicoId(ordemServicoId);
        const todasFinalizadas = execucoes.every(
            (execucao) => execucao.status.value === StatusExecucaoValues.FINALIZADO
        );

        if (todasFinalizadas && execucoes.length > 0) {
            await this.ordemServicoGateway.update(ordemServicoId, {
                status: StatusOS.from(StatusOSValues.FINALIZADA),
            });
        }
    }
}
