import { connectDatabase, closeDatabase } from '../database';
import { logger } from '../logging/logger';
import { OrderCompletionMongoGateway } from '../../Adapters/gateways/order-completion.mongo.gateway';
import { ExecutionInboxMongoGateway } from '../../Adapters/gateways/execution-inbox.mongo.gateway';
import { FinalizarOrdemAposExecucaoUseCase } from '../../application/usecases/ordem-servico/finalizar-ordem-apos-execucao.usecase';
import { ConsumeExecutionCompletedUseCase } from '../../application/usecases/consume-execution-completed.usecase';
import { parseExecutionCompleted } from './execution-event';
import { runConsumer, workerControl } from './rabbitmq';
async function main() {
    if(!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is required');
    const db=await connectDatabase();
    const finalize=new FinalizarOrdemAposExecucaoUseCase(new OrderCompletionMongoGateway(db),{emit:event=>logger.info(event)});
    const useCase=new ConsumeExecutionCompletedUseCase(new ExecutionInboxMongoGateway(db),finalize);
    try { await runConsumer(process.env.RABBITMQ_URL,'service-orders.execution',parseExecutionCompleted,event=>useCase.execute(event),workerControl()); }
    finally { await closeDatabase(); }
}
if(require.main===module) void main().catch(error=>{logger.error({msg:'execution_consumer_failed',error:error.message});process.exitCode=1;});
