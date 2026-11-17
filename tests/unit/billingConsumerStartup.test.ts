import { main } from '../../src/infrastructure/messaging/billing-consumer';
import { connectDatabase, closeDatabase } from '../../src/infrastructure/database';
import { createPaymentDelivery } from '../../src/infrastructure/composition-root/payment-delivery-container';
import { runConsumer, workerControl } from '../../src/infrastructure/messaging/rabbitmq';

jest.mock('../../src/infrastructure/database', () => ({ connectDatabase: jest.fn(), closeDatabase: jest.fn() }));
jest.mock('../../src/infrastructure/composition-root/payment-delivery-container', () => ({ createPaymentDelivery: jest.fn() }));
jest.mock('../../src/infrastructure/messaging/rabbitmq', () => ({ runConsumer: jest.fn(), workerControl: jest.fn() }));

const previousUrl = process.env.RABBITMQ_URL;
afterAll(() => { if (previousUrl === undefined) delete process.env.RABBITMQ_URL; else process.env.RABBITMQ_URL = previousUrl; });
beforeEach(() => {
    jest.resetAllMocks();
    process.env.RABBITMQ_URL = 'amqp://broker.test/oficina';
    jest.mocked(closeDatabase).mockResolvedValue(undefined);
});
test('closes MongoDB and rejects startup when the index cannot be created', async () => {
    const failure = new Error('IndexOptionsConflict');
    const createIndex = jest.fn().mockRejectedValue(failure);
    jest.mocked(connectDatabase).mockResolvedValue({ collection: () => ({ createIndex }) } as never);
    await expect(main()).rejects.toBe(failure);
    expect(closeDatabase).toHaveBeenCalledTimes(1);
    expect(createPaymentDelivery).not.toHaveBeenCalled();
    expect(workerControl).not.toHaveBeenCalled();
    expect(runConsumer).not.toHaveBeenCalled();
});
test('also closes MongoDB if subsequent consumer setup fails', async () => {
    const failure = new Error('invalid integration configuration');
    jest.mocked(connectDatabase).mockResolvedValue({ collection: () => ({ createIndex: async () => undefined }) } as never);
    jest.mocked(createPaymentDelivery).mockImplementation(() => { throw failure; });
    await expect(main()).rejects.toBe(failure);
    expect(closeDatabase).toHaveBeenCalledTimes(1);
    expect(runConsumer).not.toHaveBeenCalled();
});
