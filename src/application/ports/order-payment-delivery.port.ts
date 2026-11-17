import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
import { OrderCompletionRepository } from './order-completion.port';

export interface OrderPaymentDeliveryRepository extends OrderCompletionRepository {
    hasPaymentConfirmation(id: string): Promise<boolean>;
    findDeliveryCandidates(afterId?: string, limit?: number): Promise<string[]>;
}

export interface DeliverPaidOrder {
    execute(id: string): Promise<OrdemServico | null>;
}
