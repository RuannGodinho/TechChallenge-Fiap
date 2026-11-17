import { DeliverPaidOrder, OrderPaymentDeliveryRepository } from '../ports/order-payment-delivery.port';

/** Page through retained confirmations so failures and event ordering recover without replay. */
export class ReconcilePaidOrdersUseCase {
    private afterId?: string;
    constructor(private readonly orders: Pick<OrderPaymentDeliveryRepository, 'findDeliveryCandidates'>,
        private readonly delivery: DeliverPaidOrder,
        private readonly onError: (id: string, error: unknown) => void) {}

    async execute() {
        const ids = await this.orders.findDeliveryCandidates(this.afterId, 50);
        for (const id of ids) {
            try { await this.delivery.execute(id); }
            catch (error) { this.onError(id, error); }
        }
        this.afterId = ids.length === 50 ? ids[ids.length - 1] : undefined;
    }
}
