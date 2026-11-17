import { EventEmitter } from 'node:events';
import amqp from 'amqplib';
import { runConsumer } from '../../src/infrastructure/messaging/rabbitmq';

describe('broker-side consumer cancellation', () => {
    afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
    test.each([false, true])('reconnects and processes the next message when close rejects = %s', async rejectClose => {
        jest.useFakeTimers();
        jest.spyOn(console, 'info').mockImplementation(() => undefined);
        const control = { stopping: false };
        const delivered = { content: Buffer.from('{"id":"recovered"}'), properties: { messageId: 'message-id', headers: {} } };
        const channels = [0, 1].map(index => {
            const channel = Object.assign(new EventEmitter(), {
                assertExchange: jest.fn().mockResolvedValue(undefined), assertQueue: jest.fn().mockResolvedValue(undefined),
                bindQueue: jest.fn().mockResolvedValue(undefined), prefetch: jest.fn().mockResolvedValue(undefined),
                consume: jest.fn(async (_queue, receive) => {
                    queueMicrotask(() => receive(index === 0 ? null : delivered));
                    return { consumerTag: `consumer-${index}` };
                }),
                ack: jest.fn(), cancel: jest.fn().mockResolvedValue(undefined), close: jest.fn(),
            });
            channel.close.mockImplementation(async () => {
                if (index === 0 && rejectClose) throw new Error('channel already closing');
                channel.emit('close');
            });
            return channel;
        });
        const connections = channels.map(channel => {
            const connection = Object.assign(new EventEmitter(), {
                createConfirmChannel: jest.fn().mockResolvedValue(channel), close: jest.fn(),
            });
            connection.close.mockImplementation(async () => { connection.emit('close'); });
            return connection;
        });
        const connect = jest.spyOn(amqp, 'connect')
            .mockResolvedValueOnce(connections[0] as unknown as amqp.ChannelModel)
            .mockResolvedValueOnce(connections[1] as unknown as amqp.ChannelModel);
        const handle = jest.fn(async () => { control.stopping = true; });
        const running = runConsumer('amqp://broker.test/oficina', 'service-orders.billing', content => JSON.parse(content.toString()), handle, control);
        try {
            await jest.advanceTimersByTimeAsync(2500);
            expect(connect).toHaveBeenCalledTimes(2);
            expect(channels[0].close).toHaveBeenCalledTimes(1);
            expect(connections[0].close).toHaveBeenCalledTimes(1);
            expect(handle).toHaveBeenCalledWith({ id: 'recovered' });
            expect(channels[1].ack).toHaveBeenCalledWith(delivered);
        } finally {
            control.stopping = true;
            await jest.advanceTimersByTimeAsync(500);
            await running;
        }
    });
});
