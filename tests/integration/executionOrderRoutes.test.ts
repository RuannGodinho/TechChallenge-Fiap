import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import { createExecutionOrderRoutes } from '../../src/infrastructure/http/execution-order-routes';
import { completionMessageId, BillingExecutionCompletionAdapter } from '../../src/Adapters/adapters/billing-execution-completion.adapter';
import { ServiceHttpClient } from '../../src/Adapters/adapters/service-http.adapter';
import { ExecutionOrderController } from '../../src/Adapters/controllers/execution-order.controller';
import { ConcluirExecucaoOrdemUseCase } from '../../src/application/usecases/ordem-servico/concluir-execucao-ordem.usecase';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';

const id = new ObjectId().toString();
const order = OrdemServico.restore({ id, cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(), status: 'FINALIZADA', dataAbertura: new Date(), pecas: [], servicos: [] });
const find = jest.fn(); const save = jest.fn();
const originalFetch = global.fetch;
const billing = new BillingExecutionCompletionAdapter(new ServiceHttpClient('http://billing.test','Billing','billing-key'));
const repository = { findById: find, saveTransition: save };
const complete = new ConcluirExecucaoOrdemUseCase(repository, billing, {emit() {}});
const controller = new ExecutionOrderController(repository, complete);
const app = express(); app.use('/internal', createExecutionOrderRoutes(async () => controller));
beforeEach(() => {
    process.env.SERVICE_ORDERS_INTERNAL_API_KEY = 'orders-key';
    find.mockResolvedValue(order); save.mockReset();
    global.fetch = jest.fn(async () => new Response(null, { status: 204 }));
});
afterEach(() => { jest.clearAllMocks(); global.fetch = originalFetch; });
test('protects internal order lookup and completion', async () => {
    await request(app).get(`/internal/ordensServico/${id}`).expect(401);
    await request(app).patch(`/internal/ordensServico/${id}/finalizar`).expect(401);
    await request(app).get('/internal/ordensServico/invalid').set('x-internal-api-key','orders-key').expect(400);
    await request(app).get(`/internal/ordensServico/${id}`).set('x-internal-api-key','orders-key').expect(200);
});
test('retries Billing notification with the same completion message ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(new Response('{}', { status: 503 }));
    await request(app).patch(`/internal/ordensServico/${id}/finalizar`).set('x-internal-api-key','orders-key').expect(502);
    await request(app).patch(`/internal/ordensServico/${id}/finalizar`).set('x-internal-api-key','orders-key').expect(200);
    const bodies = (global.fetch as jest.Mock).mock.calls.map(call => JSON.parse(call[1].body));
    expect(bodies).toEqual([{messageId:completionMessageId(id)}, {messageId:completionMessageId(id)}]);
    expect(find).toHaveBeenCalledTimes(2); expect(save).not.toHaveBeenCalled();
});
test('does not notify Billing before execution has finished', async () => {
    find.mockResolvedValue(OrdemServico.restore({ id, cpfCnpj:'11144477735', veiculoId:new ObjectId().toString(),status:'RECEBIDA',dataAbertura:new Date(),pecas:[],servicos:[] }));
    await request(app).patch(`/internal/ordensServico/${id}/finalizar`).set('x-internal-api-key','orders-key').expect(409);
    expect(global.fetch).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
});
