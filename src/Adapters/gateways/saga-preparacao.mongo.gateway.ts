import { randomUUID, createHash } from 'node:crypto';
import { Db, ObjectId, ClientSession } from 'mongodb';
import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
import { SagaPreparacaoOrdemServico, EstadoSaga } from '../../enterprise/entities/saga-preparacao-ordem-servico';
import { ISagaPreparacaoPort, IResultadoSagaPort } from '../../application/ports/saga-preparacao.port';
import { OrdemServicoMapper } from './mappers/ordem-servico.mapper';
import { SagaMessage } from '../../infrastructure/messaging/saga';
export class SagaPreparacaoMongoGateway implements ISagaPreparacaoPort, IResultadoSagaPort {
    constructor(private readonly db: Db) { }
    private get sagas() { return this.db.collection<any>('SagasPreparacao'); }
    async initialize() { await this.sagas.createIndex({ orderId: 1, attempt: 1 }, { unique: true }); await this.sagas.createIndex({ orderId: 1 }, { unique: true, partialFilterExpression: { active: true } }); await this.sagas.createIndex({ deadline: 1, active: 1 }); }
    async gerenciada(id: string) { return !!await this.db.collection('OrdemServico').findOne({ _id: new ObjectId(id), sagaManaged: true }); }
    private async tx<T>(fn: (session: ClientSession) => Promise<T>) { const s = this.db.client.startSession(); try {
        return await s.withTransaction(() => fn(s)) as T;
    }
    finally {
        await s.endSession();
    } }
    private initial(orderId: string, attempt = 1): EstadoSaga { return { id: randomUUID(), orderId, attempt, stage: 'AGUARDANDO_DIAGNOSTICO', version: 0, deadline: new Date(8640000000000000) }; }
    async criar(ordem: OrdemServico, key?: string) {
        if (key && key.length > 100)
            throw Error('Conflito: chave inválida');
        return this.tx(async (session) => {
            const persistence = OrdemServicoMapper.toPersistence(ordem);
            const hash = createHash('sha256').update(JSON.stringify({ cpf: persistence.cpfCnpj, veiculo: persistence.veiculo, pecas: persistence.pecas, servicos: persistence.servicos })).digest('hex');
            if (key) {
                const saved = await this.db.collection<any>('SagaRequests').findOne({ _id: `create:${key}` }, { session });
                if (saved) {
                    if (saved.hash !== hash)
                        throw Error('Conflito: chave reutilizada com outros dados');
                    return OrdemServicoMapper.toDomain(saved.response);
                }
            }
            const row = { ...OrdemServicoMapper.toPersistence(ordem), sagaManaged: true };
            const result = await this.db.collection('OrdemServico').insertOne(row, { session });
            const id = result.insertedId.toString();
            await this.sagas.insertOne({ ...this.initial(id), active: true }, { session });
            if (key)
                await this.db.collection<any>('SagaRequests').insertOne({ _id: `create:${key}`, hash, response: { ...row, _id: result.insertedId } }, { session });
            return OrdemServicoMapper.toDomain({ ...row, _id: result.insertedId });
        });
    }
    async validarEdicao(id: string, key?: string) { const s = await this.sagas.findOne({ orderId: id, active: true }); if (s && s.stage !== 'AGUARDANDO_DIAGNOSTICO')
        throw Error('Conflito: Saga em andamento; cancelar antes de alterar itens'); }
    async repetirDiagnostico(id: string, key: string, input: unknown) { const saved = await this.db.collection<any>('SagaRequests').findOne({ _id: `diagnosis:${id}:${key}` }); if (!saved)
        return null; const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex'); if (saved.hash !== hash)
        throw Error('Conflito: chave reutilizada com outros dados'); return OrdemServicoMapper.toDomain(saved.response); }
    async salvarDiagnostico(ordem: OrdemServico, snapshot: any, key?: string, input?: unknown) {
        return this.tx(async (session) => {
            const hash = createHash('sha256').update(JSON.stringify(input ?? snapshot)).digest('hex');
            if (key) {
                const saved = await this.db.collection<any>('SagaRequests').findOne({ _id: `diagnosis:${ordem.id}:${key}` }, { session });
                if (saved) {
                    if (saved.hash !== hash)
                        throw Error('Conflito: chave reutilizada com outros dados');
                    return OrdemServicoMapper.toDomain(saved.response);
                }
            }
            const order = await this.db.collection('OrdemServico').findOne({ _id: new ObjectId(ordem.id!) }, { session });
            if (order?.status !== 'EM DIAGNOSTICO')
                throw Error('OS deve estar em diagnóstico');
            let row = await this.sagas.findOne({ orderId: ordem.id, active: true }, { session });
            if (row && row.stage !== 'AGUARDANDO_DIAGNOSTICO')
                throw Error('Conflito: Saga em andamento');
            if (!row) {
                const previous = await this.sagas.findOne({ orderId: ordem.id }, { session, sort: { attempt: -1 } });
                row = { ...this.initial(ordem.id!, (previous?.attempt ?? 0) + 1), active: true };
                await this.sagas.insertOne(row, { session });
            }
            const state: EstadoSaga = { ...row, stage: 'GERANDO_ORCAMENTO', snapshot, commandType: 'billing.CriarOrcamento' };
            await this.db.collection('OrdemServico').updateOne({ _id: order._id }, { $set: OrdemServicoMapper.toPersistence(ordem) }, { session });
            await this.persist(state, session);
            if (key)
                await this.db.collection<any>('SagaRequests').insertOne({ _id: `diagnosis:${ordem.id}:${key}`, hash, response: { ...OrdemServicoMapper.toPersistence(ordem), _id: new ObjectId(ordem.id!) } }, { session });
            return ordem;
        });
    }
    private async persist(state: EstadoSaga, session: ClientSession, status?: string) {
        const previous = state.version;
        state.version++;
        if (state.commandType && state.stage !== 'INTERVENCAO_MANUAL') {
            state.commandId = randomUUID();
            state.deadline = new Date(Date.now() + Number(process.env.SAGA_STEP_TIMEOUT_MS ?? 300000));
            const id = randomUUID();
            const event = { messageId: id, eventType: state.commandType, eventVersion: 1, orderId: state.orderId, occurredAt: new Date().toISOString(), data: { sagaId: state.id, attempt: state.attempt, commandId: state.commandId, commandType: state.commandType, snapshot: state.snapshot, estimateId: state.estimateId, estimateVersion: state.estimateVersion } };
            await this.db.collection<any>('SagaOutbox').insertOne({ _id: id, event, publishedAt: null, nextAttemptAt: new Date(), leaseUntil: null }, { session });
        }
        else if (state.stage === 'AGUARDANDO_APROVACAO')
            state.deadline = new Date(state.expiresAt!);
        const active = !['CONCLUIDA', 'COMPENSADA'].includes(state.stage);
        const result = await this.sagas.updateOne({ id: state.id, version: previous }, { $set: { ...state, active } }, { session });
        if (!result.modifiedCount)
            throw Error('Saga alterada concorrentemente');
        if (status) {
            const now = new Date();
            await this.db.collection('OrdemServico').updateOne({ _id: new ObjectId(state.orderId) }, { $set: { status, statusEnteredAt: now, sagaReady: state.stage === 'CONCLUIDA' }, $push: { statusHistory: { status, enteredAt: now } } } as never, { session });
        }
    }
    async processar(raw: unknown) {
        const m = raw as SagaMessage;
        await this.tx(async (session) => {
            const inbox = this.db.collection<any>('SagaInbox');
            if (await inbox.findOne({ _id: m.messageId }, { session }))
                return;
            const row = await this.sagas.findOne({ id: m.data.sagaId, orderId: m.orderId }, { session });
            if (!row)
                throw Error('Saga não encontrada');
            if (m.data.decision && row.stage === 'GERANDO_ORCAMENTO') {
                await this.sagas.updateOne({ id: row.id }, { $set: { pendingDecision: m.data } }, { session });
                await inbox.insertOne({ _id: m.messageId, processedAt: new Date() }, { session });
                return;
            }
            const entity = new SagaPreparacaoOrdemServico(row);
            const before = JSON.stringify(row);
            let status = entity.resultado(m.data, row.commandId, new Date());
            if (row.stage === 'AGUARDANDO_APROVACAO' && row.pendingDecision) {
                entity.resultado(row.pendingDecision, row.commandId, new Date());
                delete row.pendingDecision;
            }
            if (JSON.stringify(row) !== before)
                await this.persist(row, session, status);
            await inbox.insertOne({ _id: m.messageId, processedAt: new Date() }, { session });
        });
    }
    async podeIniciar(id:string){const row=await this.db.collection('OrdemServico').findOne({_id:new ObjectId(id)});return row?.status==='EM EXECUCAO' && (!row.sagaManaged || row.sagaReady===true);}
    async consultar(id: string) { const r = await this.sagas.findOne({ orderId: id }, { sort: { attempt: -1 } }); if (!r)
        return null; return { sagaId: r.id, orderId: r.orderId, attempt: r.attempt, stage: r.stage, version: r.version, estimateId: r.estimateId, deadline: r.deadline, error: r.error }; }
    async cancelar(orderId: string, reason = 'Cancelamento solicitado') { return this.tx(async (session) => { const row = await this.sagas.findOne({ orderId, active: true }, { session }); if (!row)
        throw Error('Conflito: nenhuma Saga ativa'); new SagaPreparacaoOrdemServico(row).cancelar(reason, new Date()); await this.persist(row, session); }); }
    async retomar(id: string) { await this.tx(async (session) => { const row = await this.sagas.findOne({ id, stage: 'INTERVENCAO_MANUAL' }, { session }); if (!row)
        throw Error('Saga não recuperável'); row.stage = 'COMPENSANDO'; row.compensationStartedAt = new Date(); await this.persist(row, session); }); }
    async verificarPrazos() {
        const rows = await this.sagas.find({ active: true, deadline: { $lte: new Date() }, stage: { $nin: ['INTERVENCAO_MANUAL', 'AGUARDANDO_DIAGNOSTICO'] } }).toArray();
        for (const row of rows)
            await this.tx(async (session) => {
                const current = await this.sagas.findOne({ id: row.id, version: row.version }, { session });
                if (!current)
                    return;
                if (current.stage === 'COMPENSANDO' && Date.now() - new Date(current.compensationStartedAt).getTime() >= Number(process.env.SAGA_COMPENSATION_TIMEOUT_MS ?? 1800000)) {
                    current.stage = 'INTERVENCAO_MANUAL';
                    current.error = 'Compensação sem confirmação';
                    await this.persist({ ...current, commandType: undefined }, session);
                    return;
                }
                const entity = new SagaPreparacaoOrdemServico(current);
                entity.cancelar('Prazo excedido', new Date());
                await this.persist(current, session);
            });
    }
}
