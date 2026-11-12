import { Collection, ObjectId } from 'mongodb';
import { parseBillingEvent, recordBillingEvent } from '../../src/infrastructure/messaging/billing-events';

const orderId = new ObjectId().toString();
const messageId = '123e4567-e89b-42d3-a456-426614174000';
const estimateId = '123e4567-e89b-42d3-a456-426614174001';
const attemptId = '123e4567-e89b-42d3-a456-426614174002';
const message = { messageId, orderId, eventType: 'payment.confirmed', eventVersion: 1 as const, occurredAt: '2026-01-01T00:00:00Z', data: { orderId, estimateId, attemptId } };

test('accepts the billing contract and rejects invalid payment events', () => {
 expect(parseBillingEvent(Buffer.from(JSON.stringify(message)))).toEqual(message);
 expect(() => parseBillingEvent(Buffer.from(JSON.stringify({ ...message, data: { ...message.data, orderId: new ObjectId().toString() } })))).toThrow('Invalid billing event');
 expect(() => parseBillingEvent(Buffer.from(JSON.stringify({ ...message, eventVersion: 2 })))).toThrow('Invalid billing event');
});
test('writes a new message atomically and acknowledges an existing message as a duplicate', async () => {
 const updateOne = jest.fn().mockResolvedValueOnce({ modifiedCount: 1 }).mockResolvedValueOnce({ modifiedCount: 0 });
 const findOne = jest.fn().mockResolvedValue({ billingEvents: [{ messageId }] });
 const collection = { updateOne, findOne } as unknown as Collection;
 expect(await recordBillingEvent(collection, message)).toBe('recorded');
 expect(updateOne.mock.calls[0][0]).toEqual({ _id: new ObjectId(orderId), 'billingEvents.messageId': { $ne: messageId } });
 expect(await recordBillingEvent(collection, message)).toBe('duplicate');
});
test('does not acknowledge an event for an unknown order', async () => {
 const collection = { updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 }), findOne: jest.fn().mockResolvedValue(null) } as unknown as Collection;
 await expect(recordBillingEvent(collection, message)).rejects.toThrow('Order not found');
});
