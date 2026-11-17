import { ExecutionInbox } from '../ports/execution-inbox.port';
import { FinalizarOrdemAposExecucaoUseCase } from './ordem-servico/finalizar-ordem-apos-execucao.usecase';
import { DeliverPaidOrder } from '../ports/order-payment-delivery.port';
export class ConsumeExecutionCompletedUseCase {
    constructor(private readonly inbox:ExecutionInbox, private readonly finalize:Pick<FinalizarOrdemAposExecucaoUseCase,'execute'>,
        private readonly delivery?: DeliverPaidOrder) {}
    async execute(event:{messageId:string;orderId:string;occurredAt:string}) {
        if(await this.inbox.contains(event.messageId)) {
            await this.delivery?.execute(event.orderId);
            return 'duplicate';
        }
        if(!await this.finalize.execute(event.orderId)) throw new Error('Order not found for execution completion');
        await this.delivery?.execute(event.orderId);
        // The status transition is itself idempotent if the process dies before recording this inbox row.
        await this.inbox.record(event);
        return 'processed';
    }
}
