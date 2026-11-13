import { DIContainer } from './di-container';
import { ExecutionOrderController } from '../../Adapters/controllers/execution-order.controller';
import { OrderCompletionMongoGateway } from '../../Adapters/gateways/order-completion.mongo.gateway';
import { BillingExecutionCompletionAdapter } from '../../Adapters/adapters/billing-execution-completion.adapter';
import { ServiceHttpClient } from '../../Adapters/adapters/service-http.adapter';
import { ConcluirExecucaoOrdemUseCase } from '../../application/usecases/ordem-servico/concluir-execucao-ordem.usecase';
export async function createExecutionOrderController() {
    const container = DIContainer.getInstance(); await container.ensureInitialized();
    const repository = new OrderCompletionMongoGateway(container.getDb());
    const billing = new BillingExecutionCompletionAdapter(new ServiceHttpClient(process.env.BILLING_SERVICE_URL, 'Billing', process.env.BILLING_INTERNAL_API_KEY));
    const complete = new ConcluirExecucaoOrdemUseCase(repository, billing, container.getObservabilityPort());
    return new ExecutionOrderController(repository, complete);
}
