import { connectDatabase, closeDatabase } from '../database';
import { SagaPreparacaoMongoGateway } from '../../Adapters/gateways/saga-preparacao.mongo.gateway';
import { SagaMongoOutbox } from '../../Adapters/gateways/saga-outbox.mongo.gateway';
import { ProcessarResultadoSagaUseCase, VerificarPrazosSagaUseCase } from '../../application/usecases/saga/processar-resultado-saga.usecase';
import { runConsumer, runOutboxPublisher, workerControl } from './rabbitmq';
import { parseSaga } from './saga';
async function main() {
    const url = process.env.RABBITMQ_URL;
    if (!url)
        throw Error('RABBITMQ_URL required');
    const db = await connectDatabase();
    const gateway = new SagaPreparacaoMongoGateway(db);
    await gateway.initialize();
    const results = new ProcessarResultadoSagaUseCase(gateway);
    const deadlines = new VerificarPrazosSagaUseCase(gateway);
    const control = workerControl();
    try {
        await Promise.all([runConsumer(url, 'service-orders.saga.results', parseSaga, m => results.execute(m), control), runOutboxPublisher(url, 'saga.commands', new SagaMongoOutbox(db), control), (async () => { while (!control.stopping) {
                try {
                    await deadlines.execute();
                }
                catch (e) {
                    console.error('saga_deadline_retry', e instanceof Error ? e.message : 'failed');
                }
                await new Promise(r => setTimeout(r, 5000));
            } })()]);
    }
    finally {
        await closeDatabase();
    }
}
if (require.main === module)
    main().catch(e => { console.error(e.message); process.exitCode = 1; });
