import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { OrderPaymentDeliveryRepository } from '../../src/application/ports/order-payment-delivery.port';
import { BillingEvent } from '../../src/application/ports/billing-event.port';
import { EntregarOrdemAposPagamentoUseCase } from '../../src/application/usecases/ordem-servico/entregar-ordem-apos-pagamento.usecase';
import { FinalizarOrdemAposExecucaoUseCase } from '../../src/application/usecases/ordem-servico/finalizar-ordem-apos-execucao.usecase';
import { ConsumeBillingEventUseCase } from '../../src/application/usecases/consume-billing-event.usecase';
import { ConsumeExecutionCompletedUseCase } from '../../src/application/usecases/consume-execution-completed.usecase';
import { ReconcilePaidOrdersUseCase } from '../../src/application/usecases/reconcile-paid-orders.usecase';
import { BillingHttpAdapter, ServiceHttpClient } from '../../src/Adapters/adapters/service-http.adapter';

const id = new ObjectId().toString();
const event: BillingEvent = {
    messageId: '123e4567-e89b-42d3-a456-426614174000', orderId: id, eventType: 'payment.confirmed',
    eventVersion: 1, occurredAt: new Date().toISOString(),
    data: { orderId: id, estimateId: '123e4567-e89b-42d3-a456-426614174001', attemptId: '123e4567-e89b-42d3-a456-426614174002' },
};

function setup(status = 'FINALIZADA', paid: boolean | Error = true) {
    let stored = OrdemServico.restore({ id, cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(),
        status, dataAbertura: new Date(), pecas: [], servicos: [] });
    let confirmation = false;
    const clone = () => OrdemServico.restore({ id, cpfCnpj: stored.cpfCnpj.value, veiculoId: stored.veiculoId.value,
        status: stored.status.value, dataAbertura: stored.dataAbertura, pecas: [], servicos: [],
        statusEnteredAt: stored.statusEnteredAt, statusHistory: stored.statusHistory.map(entry => ({ ...entry })) });
    const repository: OrderPaymentDeliveryRepository = {
        findById: jest.fn(async () => clone()),
        hasPaymentConfirmation: jest.fn(async () => confirmation),
        findDeliveryCandidates: jest.fn(async () => confirmation && stored.status.value === 'FINALIZADA' ? [id] : []),
        saveTransition: jest.fn(async (_id, expected, next) => {
            if (stored.status.value !== expected) return null;
            stored = next;
            return clone();
        }),
    };
    const billing = { isPaymentConfirmed: jest.fn(async () => {
        if (paid instanceof Error) throw paid;
        return paid;
    }) };
    const observability = { emit: jest.fn() };
    const delivery = new EntregarOrdemAposPagamentoUseCase(repository, billing, observability);
    const record = jest.fn(async (message: BillingEvent): Promise<'recorded' | 'duplicate'> => {
        if (message.eventType !== 'payment.confirmed') return 'recorded';
        if (confirmation) return 'duplicate';
        confirmation = true;
        return 'recorded';
    });
    return { repository, billing, delivery, record, observability, current: () => clone(),
        consume: new ConsumeBillingEventUseCase({ record }, delivery) };
}

describe('Dada uma OS finalizada, quando o pagamento for confirmado', () => {
    test('então entrega automaticamente e registra uma única transição, mesmo com duplicatas concorrentes', async () => {
        const context = setup();
        await Promise.all([context.consume.execute(event), context.consume.execute(event)]);
        await context.consume.execute(event);
        expect(context.current().status.value).toBe('ENTREGUE');
        expect(context.current().statusHistory.filter(entry => entry.status === 'ENTREGUE')).toHaveLength(1);
        expect(context.observability.emit.mock.calls.filter(([entry]) => entry.msg === 'os_auto_delivered')).toHaveLength(1);
    });

    test.each(['estimate.created', 'estimate.approved', 'estimate.rejected', 'payment.reversed'])(
        'não entrega ao receber %s', async eventType => {
            const context = setup();
            await context.consume.execute({ ...event, eventType });
            expect(context.current().status.value).toBe('FINALIZADA');
            expect(context.billing.isPaymentConfirmed).not.toHaveBeenCalled();
        });

    test('não entrega sem confirmação registrada, mesmo se chamada diretamente', async () => {
        const context = setup();
        await expect(context.delivery.execute(id)).resolves.toBeNull();
        expect(context.billing.isPaymentConfirmed).not.toHaveBeenCalled();
    });

    test('não entrega com evento antigo se Billing indicar pagamento não confirmado ou estornado', async () => {
        const context = setup('FINALIZADA', false);
        await context.consume.execute(event);
        expect(context.current().status.value).toBe('FINALIZADA');
        expect(context.repository.saveTransition).not.toHaveBeenCalled();
    });

    test('não entrega com Billing indisponível e recupera em reprocessamento de evento já registrado', async () => {
        const context = setup('FINALIZADA', new Error('Billing unavailable'));
        await expect(context.consume.execute(event)).rejects.toThrow('Billing unavailable');
        expect(context.current().status.value).toBe('FINALIZADA');
        context.billing.isPaymentConfirmed.mockResolvedValue(true);
        await expect(context.consume.execute(event)).resolves.toBe('duplicate');
        expect(context.current().status.value).toBe('ENTREGUE');
    });
});

describe('Dado que as filas de execução e pagamento são independentes', () => {
    test.each(['RECEBIDA', 'EM DIAGNOSTICO', 'AGUARDANDO APROVACAO'])(
        'confirmação não pode pular o estado %s', async status => {
            const context = setup(status);
            await context.consume.execute(event);
            expect(context.current().status.value).toBe(status);
            expect(context.billing.isPaymentConfirmed).not.toHaveBeenCalled();
        });

    test('pagamento antecipado aguarda a conclusão da execução para entregar', async () => {
        const context = setup('EM EXECUCAO');
        await context.consume.execute(event);
        expect(context.current().status.value).toBe('EM EXECUCAO');
        expect(context.billing.isPaymentConfirmed).not.toHaveBeenCalled();
        const recordExecution = jest.fn();
        const execution = new ConsumeExecutionCompletedUseCase({ contains: async () => false, record: recordExecution },
            new FinalizarOrdemAposExecucaoUseCase(context.repository, context.observability), context.delivery);
        await execution.execute({ messageId: 'execution-event', orderId: id, occurredAt: new Date().toISOString() });
        expect(context.current().statusHistory.map(entry => entry.status)).toEqual(['EM EXECUCAO', 'FINALIZADA', 'ENTREGUE']);
        expect(recordExecution).toHaveBeenCalledTimes(1);
    });

    test('execução concluída antes do pagamento permanece FINALIZADA até chegar confirmação', async () => {
        const context = setup('EM EXECUCAO');
        const execution = new ConsumeExecutionCompletedUseCase({ contains: async () => false, record: jest.fn() },
            new FinalizarOrdemAposExecucaoUseCase(context.repository, context.observability), context.delivery);
        await execution.execute({ messageId: 'execution-event', orderId: id, occurredAt: new Date().toISOString() });
        expect(context.current().status.value).toBe('FINALIZADA');
        await context.consume.execute(event);
        expect(context.current().status.value).toBe('ENTREGUE');
    });

    test('reconciliação recupera confirmação persistida após falha prolongada, sem replay da fila', async () => {
        const context = setup('FINALIZADA', new Error('Billing unavailable'));
        await expect(context.consume.execute(event)).rejects.toThrow();
        const errors = jest.fn();
        const reconcile = new ReconcilePaidOrdersUseCase(context.repository, context.delivery, errors);
        await reconcile.execute();
        expect(errors).toHaveBeenCalledTimes(1);
        expect(context.current().status.value).toBe('FINALIZADA');
        context.billing.isPaymentConfirmed.mockResolvedValue(true);
        await reconcile.execute();
        expect(context.current().status.value).toBe('ENTREGUE');
    });

    test('reconciliação avança a página mesmo com pagamentos não confirmados e reinicia a varredura', async () => {
        const firstPage = Array.from({ length: 50 }, () => new ObjectId().toString());
        const findDeliveryCandidates = jest.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce(['last']).mockResolvedValue([]);
        const deliver = jest.fn().mockResolvedValue(null);
        const reconcile = new ReconcilePaidOrdersUseCase({ findDeliveryCandidates }, { execute: deliver }, jest.fn());
        await reconcile.execute(); await reconcile.execute(); await reconcile.execute();
        expect(findDeliveryCandidates.mock.calls).toEqual([[undefined, 50], [firstPage[49], 50], [undefined, 50]]);
        expect(deliver).toHaveBeenCalledWith('last');
    });
});

test('confirmação HTTP inválida ou indisponível não autoriza a entrega', async () => {
    const context = setup();
    await context.record(event);
    const original = global.fetch;
    try {
        const billing = new BillingHttpAdapter(new ServiceHttpClient('http://billing.test', 'Billing', 'key'));
        const delivery = new EntregarOrdemAposPagamentoUseCase(context.repository, billing, context.observability);
        for (const response of [new Response('{"paid":"true"}'), new Response('{}', { status: 503 }), new Response('invalid')]) {
            global.fetch = jest.fn().mockResolvedValue(response);
            await expect(delivery.execute(id)).rejects.toThrow();
            expect(context.current().status.value).toBe('FINALIZADA');
        }
    } finally { global.fetch = original; }
});

test('entrega usa consulta autenticada ao Billing para a OS correta', async () => {
    const context = setup();
    await context.record(event);
    const original = global.fetch;
    try {
        global.fetch = jest.fn().mockResolvedValue(new Response('{"paid":true}'));
        const billing = new BillingHttpAdapter(new ServiceHttpClient('http://billing.test', 'Billing', 'internal-key'));
        await new EntregarOrdemAposPagamentoUseCase(context.repository, billing, context.observability).execute(id);
        const [url, options] = jest.mocked(global.fetch).mock.calls[0];
        expect(String(url)).toBe(`http://billing.test/internal/orders/${id}/payment-status`);
        expect(options?.headers).toMatchObject({ 'x-internal-api-key': 'internal-key' });
        expect(context.current().status.value).toBe('ENTREGUE');
    } finally { global.fetch = original; }
});

test('confirmação de OS inexistente exige recuperação em vez de ser reconhecida como entrega', async () => {
    const context = setup();
    jest.mocked(context.repository.findById).mockResolvedValue(null);
    await expect(context.consume.execute(event)).rejects.toThrow('Order not found');
    expect(context.repository.saveTransition).not.toHaveBeenCalled();
});

test('conflitos concorrentes persistentes exigem retry sem confirmar entrega', async () => {
    const context = setup();
    await context.record(event);
    jest.mocked(context.repository.saveTransition).mockResolvedValue(null);
    await expect(context.delivery.execute(id)).rejects.toThrow('Ordem alterada');
    expect(context.current().status.value).toBe('FINALIZADA');
    expect(context.repository.saveTransition).toHaveBeenCalledTimes(3);
});
