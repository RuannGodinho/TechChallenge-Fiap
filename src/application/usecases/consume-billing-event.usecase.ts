import { BillingEvent, BillingEventRecorder } from '../ports/billing-event.port';
import { DeliverPaidOrder } from '../ports/order-payment-delivery.port';

export class ConsumeBillingEventUseCase {
    constructor(private readonly events: BillingEventRecorder, private readonly delivery: DeliverPaidOrder) {}

    async execute(event: BillingEvent) {
        const result = await this.events.record(event);
        // A previous attempt may have recorded the event and failed before delivery.
        if (event.eventType === 'payment.confirmed') await this.delivery.execute(event.orderId);
        return result;
    }
}
