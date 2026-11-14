import { ExecutionInbox } from '../ports/execution-inbox.port';
import { FinalizarOrdemAposExecucaoUseCase } from './ordem-servico/finalizar-ordem-apos-execucao.usecase';
export class ConsumeExecutionCompletedUseCase {
    constructor(private readonly inbox:ExecutionInbox, private readonly finalize:Pick<FinalizarOrdemAposExecucaoUseCase,'execute'>) {}
    async execute(event:{messageId:string;orderId:string;occurredAt:string}) {
        if(await this.inbox.contains(event.messageId)) return 'duplicate';
        if(!await this.finalize.execute(event.orderId)) throw new Error('Order not found for execution completion');
        // The status transition is itself idempotent if the process dies before recording this inbox row.
        await this.inbox.record(event);
        return 'processed';
    }
}
