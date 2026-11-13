import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
export interface OrderCompletionRepository {
    findById(id: string): Promise<OrdemServico | null>;
    saveTransition(id: string, expectedStatus: string, order: OrdemServico): Promise<OrdemServico | null>;
}
export interface ExecutionCompletionNotifier { notify(orderId: string): Promise<void>; }
export class OrderCompletionConflict extends Error {}
