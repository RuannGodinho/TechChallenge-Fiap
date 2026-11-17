import { OrderCompletionConflict } from '../../ports/order-completion.port';
import { OrderPaymentDeliveryRepository, DeliverPaidOrder } from '../../ports/order-payment-delivery.port';
import { IOrcamentoPort } from '../../ports/orcamento.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent } from '../../observability/business-events';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';

/** Delivery requires completed execution and a fresh authoritative Billing check. */
export class EntregarOrdemAposPagamentoUseCase implements DeliverPaidOrder {
    constructor(
        private readonly orders: OrderPaymentDeliveryRepository,
        private readonly billing: Required<Pick<IOrcamentoPort, 'isPaymentConfirmed'>>,
        private readonly observability: IObservabilityPort,
    ) {}

    async execute(id: string) {
        for (let attempt = 0; attempt < 3; attempt++) {
            const order = await this.orders.findById(id);
            if (!order) throw new Error('Order not found for payment confirmation');
            if (order.status.value === 'ENTREGUE') return order;
            if (order.status.value !== 'FINALIZADA') return null;
            if (!await this.orders.hasPaymentConfirmation(id)) return null;
            // A delayed confirmation may refer to an already reversed payment.
            // Errors propagate: an unavailable provider never authorizes delivery.
            if (await this.billing.isPaymentConfirmed(id) !== true) return null;

            const transition = order.transicionarStatus(StatusOS.from('ENTREGUE'));
            const persisted = await this.orders.saveTransition(id, 'FINALIZADA', order);
            if (!persisted) continue;
            this.observability.emit({ msg: BusinessEvent.osAutoDelivered, ordemServicoId: id });
            this.observability.emit({ msg: BusinessEvent.osStatusChanged, ordemServicoId: id, ...transition });
            return persisted;
        }
        throw new OrderCompletionConflict('Ordem alterada durante a entrega automática; repita a operação');
    }
}
