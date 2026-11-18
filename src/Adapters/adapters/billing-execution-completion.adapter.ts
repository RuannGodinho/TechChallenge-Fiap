import { createHash } from 'node:crypto';
import { ExecutionCompletionNotifier } from '../../application/ports/order-completion.port';
import { ServiceHttpClient } from './service-http.adapter';
export function completionMessageId(orderId: string): string {
    const hex = createHash('sha256').update(`execution-complete:${orderId}`).digest('hex');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
export class BillingExecutionCompletionAdapter implements ExecutionCompletionNotifier {
    constructor(private readonly client: ServiceHttpClient) {}
    async notify(orderId: string): Promise<void> {
        await this.client.request(`/internal/orders/${encodeURIComponent(orderId)}/execution-complete`, 'POST', { messageId: completionMessageId(orderId) });
    }
}
