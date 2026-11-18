import { ExecutionCompletionNotifier, OrderCompletionRepository } from '../../ports/order-completion.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { FinalizarOrdemAposExecucaoUseCase } from './finalizar-ordem-apos-execucao.usecase';

/** Synchronous endpoint compatibility; event consumers use the pure finalization case. */
export class ConcluirExecucaoOrdemUseCase {
    private readonly finalize: FinalizarOrdemAposExecucaoUseCase;
    constructor(orders: OrderCompletionRepository, private readonly billing: ExecutionCompletionNotifier, observability: IObservabilityPort) {
        this.finalize = new FinalizarOrdemAposExecucaoUseCase(orders,observability);
    }
    async execute(id:string) {
        const order=await this.finalize.execute(id);
        if(order) await this.billing.notify(id);
        return order;
    }
}
