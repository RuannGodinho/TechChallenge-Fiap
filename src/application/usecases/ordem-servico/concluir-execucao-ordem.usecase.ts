import { ExecutionCompletionNotifier, OrderCompletionConflict, OrderCompletionRepository } from '../../ports/order-completion.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent } from '../../observability/business-events';

export class ConcluirExecucaoOrdemUseCase {
    constructor(private readonly orders: OrderCompletionRepository, private readonly billing: ExecutionCompletionNotifier, private readonly observability: IObservabilityPort) {}
    async execute(id: string) {
        for (let attempt = 0; attempt < 3; attempt++) {
            const order = await this.orders.findById(id);
            if (!order) return null;
            const previousStatus = order.status.value;
            let transition;
            try { transition = order.concluirExecucao(); }
            catch { throw new OrderCompletionConflict('Ordem não está em execução'); }
            const persisted = transition ? await this.orders.saveTransition(id, previousStatus, order) : order;
            if (!persisted) continue;
            if (transition) {
                this.observability.emit({ msg: BusinessEvent.osAutoFinalized, ordemServicoId: id });
                this.observability.emit({ msg: BusinessEvent.osStatusChanged, ordemServicoId: id, ...transition });
            }
            // Notify only after persistence; a repeated command retries a failed notification.
            await this.billing.notify(id);
            return persisted;
        }
        throw new OrderCompletionConflict('Ordem alterada durante a finalização; repita a operação');
    }
}
