import { randomUUID } from 'node:crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { OrdemServicoMongoGateway } from '../../src/Adapters/gateways/ordem-servico.mongo.gateway';
import { OrderCompletionMongoGateway } from '../../src/Adapters/gateways/order-completion.mongo.gateway';
import { SagaPreparacaoMongoGateway } from '../../src/Adapters/gateways/saga-preparacao.mongo.gateway';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { StatusOS } from '../../src/enterprise/value-objects/status-os.vo';

const integration = process.env.TEST_ORDERS_MONGO_URL ? describe : describe.skip;
integration('order persistence and Saga concurrency with MongoDB', () => {
    const client = new MongoClient(process.env.TEST_ORDERS_MONGO_URL ?? 'mongodb://localhost:27017');
    // Always select a new test-only database, independently of any database in the supplied URI.
    const db = client.db(`pr_review_orders_${process.pid}_${randomUUID().replace(/-/g, '')}`);
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const base = () => ({ _id: new ObjectId(), cpfCnpj: '11144477735', veiculo: new ObjectId(), status: 'EM EXECUCAO', dataAbertura: createdAt, pecas: [], servicos: [] });
    beforeAll(async () => { await client.connect(); }, 20000);
    afterEach(async () => { await db.dropDatabase(); });
    afterAll(async () => { await client.close(); });

    test('a delayed ordinary update cannot revert completion or erase its history', async () => {
        const row = base();
        await db.collection('OrdemServico').insertOne(row);
        const ordinary = new OrdemServicoMongoGateway(db), completion = new OrderCompletionMongoGateway(db);
        let release!: () => void, reached!: () => void;
        const blocked = new Promise<void>(resolve => { release = resolve; });
        const loaded = new Promise<void>(resolve => { reached = resolve; });
        const useCase = new AtualizarOrdemServicoUseCase(ordinary,
            { existsByCpf: async () => { reached(); await blocked; return true; } },
            { existsById: async () => true }, { createExecucoesParaServicos: async () => undefined },
            { execute: jest.fn() } as unknown as AlterarStatusOrdemServicoUseCase,
            { execute: jest.fn() } as unknown as AtualizarItensOrdemServicoUseCase);
        const pending = useCase.execute(row._id.toString(), { cpfCnpj: row.cpfCnpj });
        const rejected = expect(pending).rejects.toThrow('Conflito');
        await loaded;
        try {
            const finished = (await completion.findById(row._id.toString()))!;
            finished.concluirExecucao();
            expect(await completion.saveTransition(row._id.toString(), 'EM EXECUCAO', finished)).not.toBeNull();
        } finally { release(); }
        await rejected;
        const persisted = await db.collection('OrdemServico').findOne({ _id: row._id });
        expect(persisted?.status).toBe('FINALIZADA');
        expect(persisted?.statusHistory.map((entry: { status: string }) => entry.status)).toEqual(['EM EXECUCAO', 'FINALIZADA']);
    });

    test('ordinary updates still save their own transitions and history', async () => {
        const row = { ...base(), status: 'RECEBIDA' };
        await db.collection('OrdemServico').insertOne(row);
        const gateway = new OrdemServicoMongoGateway(db), order = (await gateway.findById(row._id.toString()))!;
        order.transicionarStatus(StatusOS.from('EM DIAGNOSTICO'));
        const saved = await gateway.update(row._id.toString(), order, 'RECEBIDA');
        expect(saved?.status.value).toBe('EM DIAGNOSTICO');
        expect(saved?.statusHistory.map(entry => entry.status)).toEqual(['RECEBIDA', 'EM DIAGNOSTICO']);
        await expect(gateway.update(new ObjectId().toString(), order, 'RECEBIDA')).resolves.toBeNull();
    });

    test('completion initializes missing history from the restored legacy baseline', async () => {
        const row = base();
        await db.collection('OrdemServico').insertOne(row);
        const gateway = new OrderCompletionMongoGateway(db), order = (await gateway.findById(row._id.toString()))!;
        order.concluirExecucao();
        const saved = (await gateway.saveTransition(row._id.toString(), 'EM EXECUCAO', order))!;
        expect(saved.statusHistory).toEqual(order.statusHistory);
        expect(saved.statusHistory[0]).toEqual({ status: 'EM EXECUCAO', enteredAt: createdAt });
        await expect(gateway.saveTransition(row._id.toString(), 'EM EXECUCAO', order)).resolves.toBeNull();
        expect((await gateway.findById(row._id.toString()))?.statusHistory).toHaveLength(2);
    });

    test('completion appends to existing stored history rather than replacing it with its snapshot', async () => {
        const row = { ...base(), statusHistory: [{ status: 'EM EXECUCAO', enteredAt: createdAt }] };
        await db.collection('OrdemServico').insertOne(row);
        const gateway = new OrderCompletionMongoGateway(db), order = (await gateway.findById(row._id.toString()))!;
        const recovered = { status: 'EM EXECUCAO', enteredAt: new Date('2024-01-02T00:00:00Z') };
        await db.collection('OrdemServico').updateOne({ _id: row._id }, { $push: { statusHistory: recovered } } as never);
        order.concluirExecucao();
        const saved = (await gateway.saveTransition(row._id.toString(), 'EM EXECUCAO', order))!;
        expect(saved.statusHistory).toEqual([row.statusHistory[0], recovered, order.statusHistory[order.statusHistory.length - 1]]);
    });

    test.each([
        [0, 'execution.CancelarPreparacao'], [1, 'execution.LiberarEstoque'], [2, 'billing.CancelarOrcamento'],
    ] as const)('resuming timed-out compensation %i emits the outstanding command and advances on its acknowledgement', async (index, command) => {
        const id = randomUUID(), row = base(), oldCommand = randomUUID();
        await db.collection('OrdemServico').insertOne(row);
        await db.collection('SagasPreparacao').insertOne({
            id, orderId: row._id.toString(), attempt: 1, version: 0, active: true, stage: 'COMPENSANDO', compensation: index,
            commandId: oldCommand, commandType: command, deadline: new Date(0), compensationStartedAt: new Date(0),
        });
        const gateway = new SagaPreparacaoMongoGateway(db);
        await gateway.initialize();
        await gateway.verificarPrazos();
        expect((await db.collection('SagasPreparacao').findOne({ id }))?.stage).toBe('INTERVENCAO_MANUAL');
        expect(await db.collection('SagaOutbox').countDocuments()).toBe(0);
        await gateway.retomar(id);
        const resumed = (await db.collection('SagasPreparacao').findOne({ id }))!;
        const outbox = (await db.collection('SagaOutbox').findOne({}))!;
        expect(resumed.stage).toBe('COMPENSANDO');
        expect(resumed.commandType).toBe(command);
        expect(resumed.commandId).not.toBe(oldCommand);
        expect(outbox.event.eventType).toBe(command);
        expect(outbox.event.data.commandId).toBe(resumed.commandId);
        await gateway.processar({ messageId: randomUUID(), orderId: row._id.toString(), data: {
            sagaId: id, attempt: 1, commandId: resumed.commandId, commandType: command, ok: true,
        } });
        const advanced = (await db.collection('SagasPreparacao').findOne({ id }))!;
        expect(advanced.compensation).toBe(index + 1);
        expect(advanced.stage).toBe(index === 2 ? 'COMPENSADA' : 'COMPENSANDO');
    });
});
