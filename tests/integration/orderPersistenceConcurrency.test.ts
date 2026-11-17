import { randomUUID } from 'node:crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { OrdemServicoMongoGateway } from '../../src/Adapters/gateways/ordem-servico.mongo.gateway';
import { OrderCompletionMongoGateway } from '../../src/Adapters/gateways/order-completion.mongo.gateway';
import { SagaPreparacaoMongoGateway } from '../../src/Adapters/gateways/saga-preparacao.mongo.gateway';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { StatusOS } from '../../src/enterprise/value-objects/status-os.vo';
import { OrdemPecaItem } from '../../src/enterprise/value-objects/ordem-peca-item.vo';

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

    test.each(['cpfCnpj', 'veiculoId'] as const)('a managed %s edit preserves a diagnosis committed while its lookup is pending', async field => {
        const row = { ...base(), status: 'EM DIAGNOSTICO', sagaManaged: true };
        await db.collection('OrdemServico').insertOne(row);
        const orders = new OrdemServicoMongoGateway(db), saga = new SagaPreparacaoMongoGateway(db);
        await saga.initialize();
        let release!: () => void, reached!: () => void;
        const blocked = new Promise<void>(resolve => { release = resolve; });
        const loaded = new Promise<void>(resolve => { reached = resolve; });
        const lookup = async () => { reached(); await blocked; return true; };
        const useCase = new AtualizarOrdemServicoUseCase(orders, { existsByCpf: lookup }, { existsById: lookup },
            { createExecucoesParaServicos: jest.fn() }, { execute: jest.fn() } as unknown as AlterarStatusOrdemServicoUseCase,
            { execute: jest.fn() } as unknown as AtualizarItensOrdemServicoUseCase, saga);
        const newVehicle = new ObjectId().toString();
        const input = field === 'cpfCnpj' ? { cpfCnpj: '81788455045' } : { veiculoId: newVehicle };
        const pending = useCase.execute(row._id.toString(), input);
        await loaded;
        const partId = new ObjectId().toString(), serviceId = new ObjectId().toString();
        const snapshot = { ordemServicoId: row._id.toString(), valorTotal: 140,
            pecas: [{ id: partId, nome: 'Filtro', preco: 20, quantidade: 2 }],
            servicos: [{ id: serviceId, nome: 'Troca', preco: 100 }] };
        try {
            const diagnosis = (await orders.findById(row._id.toString()))!;
            diagnosis.aplicarItens([OrdemPecaItem.create(partId, 2, 20)], [serviceId], 140);
            await saga.salvarDiagnostico(diagnosis, snapshot, 'diagnosis-key', { pecas: [{ pecaId: partId, quantidade: 2 }], servicos: [serviceId] });
        } finally { release(); }
        const updated = await pending;
        expect(updated.status.value).toBe('EM DIAGNOSTICO');
        expect(updated.pecas.map(item => item.pecaId.value)).toEqual([partId]);
        expect(updated.servicos).toEqual([serviceId]);
        expect(updated.valorTotal).toBe(snapshot.valorTotal);
        expect(updated.cpfCnpj.value).toBe(field === 'cpfCnpj' ? input.cpfCnpj : row.cpfCnpj);
        expect(updated.veiculoId.value).toBe(field === 'veiculoId' ? newVehicle : row.veiculo.toString());
        const state = (await db.collection('SagasPreparacao').findOne({ orderId: row._id.toString() }))!;
        const outbox = (await db.collection('SagaOutbox').findOne({}))!;
        expect(state.snapshot).toEqual(snapshot);
        expect(outbox.event.data.snapshot).toEqual(snapshot);
    });

    test('a managed status-only edit still persists the transition and its history', async () => {
        const row = { ...base(), status: 'RECEBIDA', sagaManaged: true };
        await db.collection('OrdemServico').insertOne(row);
        const orders = new OrdemServicoMongoGateway(db), saga = new SagaPreparacaoMongoGateway(db);
        const stock = { assertQuantidadeDisponivel: jest.fn(), registrarSaidaOS: jest.fn() };
        const status = new AlterarStatusOrdemServicoUseCase({ createPendente: jest.fn(), isLatestOrcamentoApproved: jest.fn() }, stock, { emit() {} });
        const useCase = new AtualizarOrdemServicoUseCase(orders, { existsByCpf: jest.fn() }, { existsById: jest.fn() },
            { createExecucoesParaServicos: jest.fn() }, status, { execute: jest.fn() } as unknown as AtualizarItensOrdemServicoUseCase, saga);
        const saved = await useCase.execute(row._id.toString(), { status: 'EM DIAGNOSTICO' });
        expect(saved.status.value).toBe('EM DIAGNOSTICO');
        expect(saved.statusHistory.map(entry => entry.status)).toEqual(['RECEBIDA', 'EM DIAGNOSTICO']);
        expect((await orders.findById(row._id.toString()))?.statusHistory).toEqual(saved.statusHistory);
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
