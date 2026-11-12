import { Collection, ObjectId } from 'mongodb';

export interface BillingEvent {
 messageId: string;
 eventType: string;
 eventVersion: 1;
 orderId: string;
 occurredAt: string;
 data: { orderId: string; estimateId: string; attemptId?: string };
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowed = new Set(['estimate.created', 'estimate.approved', 'estimate.rejected', 'payment.confirmed', 'payment.reversed']);
export function parseBillingEvent(raw: Buffer): BillingEvent {
 const event = JSON.parse(raw.toString('utf8'));
 if (!event || !uuid.test(event.messageId ?? '') || !allowed.has(event.eventType) || event.eventVersion !== 1 || !ObjectId.isValid(event.orderId) || !event.data || event.data.orderId !== event.orderId || !uuid.test(event.data.estimateId ?? '') || (event.eventType.startsWith('payment.') && !uuid.test(event.data.attemptId ?? '')) || typeof event.occurredAt !== 'string' || !Number.isFinite(Date.parse(event.occurredAt))) throw new Error('Invalid billing event');
 return { messageId: event.messageId, eventType: event.eventType, eventVersion: 1, orderId: event.orderId, occurredAt: event.occurredAt, data: { orderId: event.data.orderId, estimateId: event.data.estimateId, ...(event.data.attemptId ? { attemptId: event.data.attemptId } : {}) } };
}

// Deduplication and event recording are a single atomic write on the order document.
export async function recordBillingEvent(collection: Collection, event: BillingEvent): Promise<'recorded' | 'duplicate'> {
 const id = new ObjectId(event.orderId);
 const result = await collection.updateOne({ _id: id, 'billingEvents.messageId': { $ne: event.messageId } }, { $push: { billingEvents: event } } as never);
 if (result.modifiedCount === 1) return 'recorded';
 const order = await collection.findOne({ _id: id }, { projection: { _id: 1, 'billingEvents.messageId': 1 } });
 if (!order) throw new Error('Order not found');
 if (!Array.isArray(order.billingEvents) || !order.billingEvents.some((item: { messageId?: string }) => item.messageId === event.messageId)) throw new Error('Billing event was not recorded');
 return 'duplicate';
}
