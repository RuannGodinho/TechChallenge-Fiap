export interface BillingEvent {
    messageId: string;
    eventType: string;
    eventVersion: 1;
    orderId: string;
    occurredAt: string;
    data: { orderId: string; estimateId: string; attemptId?: string };
}

export interface BillingEventRecorder {
    record(event: BillingEvent): Promise<'recorded' | 'duplicate'>;
}
