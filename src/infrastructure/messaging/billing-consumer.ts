import { connectDatabase, closeDatabase } from '../database';
import { parseBillingEvent, recordBillingEvent } from './billing-events';
import { runConsumer, workerControl } from './rabbitmq';
import { ConsumeBillingEventUseCase } from '../../application/usecases/consume-billing-event.usecase';
import { ReconcilePaidOrdersUseCase } from '../../application/usecases/reconcile-paid-orders.usecase';
import { createPaymentDelivery } from '../composition-root/payment-delivery-container';
import { logger } from '../logging/logger';
export async function main() {
    if(!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is required');
    const db=await connectDatabase();
    try {
        await db.collection('OrdemServico').createIndex(
            { status: 1, 'billingEvents.eventType': 1, _id: 1 }, { name: 'payment_delivery_candidates' },
        );
        const { orders, delivery } = createPaymentDelivery(db);
        const control = workerControl();
        const consume = new ConsumeBillingEventUseCase({ record: event => recordBillingEvent(db.collection('OrdemServico'), event) }, delivery);
        const reconcile = new ReconcilePaidOrdersUseCase(orders, delivery, (id, error) =>
            logger.error({ msg: 'paid_order_delivery_retry', ordemServicoId: id, err: error }));
        const reconciliationLoop = async () => {
            while (!control.stopping) {
                try { await reconcile.execute(); }
                catch (error) { logger.error({ msg: 'paid_order_reconciliation_failed', err: error }); }
                if (!control.stopping) await new Promise(resolve => setTimeout(resolve, 10000));
            }
        };
        await Promise.all([reconciliationLoop(), runConsumer(process.env.RABBITMQ_URL,'service-orders.billing',(content,messageId)=>{
            const event=parseBillingEvent(content);
            if(event.messageId!==messageId) throw new Error('Message ID mismatch');
            return event;
        },event=>consume.execute(event),control)]);
    } finally { await closeDatabase(); }
}
if(require.main===module) void main().catch(error=>{console.error(error.message);process.exitCode=1;});
