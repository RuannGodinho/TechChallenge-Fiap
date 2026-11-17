import { Db } from 'mongodb';
import { OrderCompletionMongoGateway } from '../../Adapters/gateways/order-completion.mongo.gateway';
import { BillingHttpAdapter, ServiceHttpClient } from '../../Adapters/adapters/service-http.adapter';
import { EntregarOrdemAposPagamentoUseCase } from '../../application/usecases/ordem-servico/entregar-ordem-apos-pagamento.usecase';
import { logger } from '../logging/logger';

export function createPaymentDelivery(db: Db) {
    const orders = new OrderCompletionMongoGateway(db);
    const billing = new BillingHttpAdapter(new ServiceHttpClient(
        process.env.BILLING_SERVICE_URL, 'Billing', process.env.BILLING_INTERNAL_API_KEY,
    ));
    const delivery = new EntregarOrdemAposPagamentoUseCase(orders, billing, { emit: event => logger.info(event) });
    return { orders, delivery };
}
