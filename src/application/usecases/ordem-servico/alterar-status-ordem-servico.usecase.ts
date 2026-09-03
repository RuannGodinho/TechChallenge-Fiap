import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { IOrcamentoPort } from '../../ports/orcamento.port';
import { IEstoqueMovimentacaoPort } from '../../ports/estoque-movimentacao.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent, BusinessReason } from '../../observability/business-events';

export class AlterarStatusOrdemServicoUseCase {
    constructor(
        private readonly orcamentoPort: IOrcamentoPort,
        private readonly estoqueMovimentacaoPort: IEstoqueMovimentacaoPort,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(ordem: OrdemServico, novoStatus: string): Promise<void> {
        let status: StatusOS;

        try {
            status = StatusOS.from(novoStatus);
        } catch (error) {
            this.observability.emit({
                msg: BusinessEvent.osProcessingFailed,
                alert: true,
                reason: BusinessReason.illegalTransition,
                ordemServicoId: ordem.id,
                from: ordem.status.value,
                to: novoStatus,
            });
            throw error;
        }

        if (status.value === StatusOSValues.EM_EXECUCAO) {
            for (const item of ordem.pecas) {
                try {
                    await this.estoqueMovimentacaoPort.assertQuantidadeDisponivel(
                        item.pecaId.value,
                        item.quantidade
                    );
                } catch (error) {
                    this.observability.emit({
                        msg: BusinessEvent.osProcessingFailed,
                        alert: true,
                        reason: BusinessReason.estoqueInsuficiente,
                        ordemServicoId: ordem.id,
                        pecaId: item.pecaId.value,
                    });
                    throw error;
                }
            }

            for (const item of ordem.pecas) {
                await this.estoqueMovimentacaoPort.registrarSaidaOS(
                    item.pecaId.value,
                    item.quantidade
                );
                this.observability.emit({
                    msg: BusinessEvent.estoqueMovimentado,
                    ordemServicoId: ordem.id,
                    pecaId: item.pecaId.value,
                    quantidade: item.quantidade,
                    origem: 'OS',
                });
            }

            const aprovado = await this.orcamentoPort.isLatestOrcamentoApproved(ordem.id!);

            if (!aprovado) {
                this.observability.emit({
                    msg: BusinessEvent.osProcessingFailed,
                    alert: true,
                    reason: BusinessReason.orcamentoNaoAprovado,
                    ordemServicoId: ordem.id,
                });
                throw new Error(
                    'Não é possível iniciar a execução da Ordem de Serviço se o orcamento não estiver aprovado.'
                );
            }
        }

        try {
            const transition = ordem.transicionarStatus(status);
            this.observability.emit({
                msg: BusinessEvent.osStatusChanged,
                ordemServicoId: ordem.id,
                from: transition.from,
                to: transition.to,
                durationMs: transition.durationMs,
            });
        } catch (error) {
            this.observability.emit({
                msg: BusinessEvent.osProcessingFailed,
                alert: true,
                reason: BusinessReason.illegalTransition,
                ordemServicoId: ordem.id,
                from: ordem.status.value,
                to: status.value,
            });
            throw error;
        }
    }
}
