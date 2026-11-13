import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import routes, { completionMessageId } from '../../src/infrastructure/http/execution-order-routes';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';

const app = express(); app.use('/internal', routes);
const id = new ObjectId().toString();
const order = OrdemServico.restore({ id, cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(), status: 'FINALIZADA', dataAbertura: new Date(), pecas: [], servicos: [] });
const finalize = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => {
    process.env.SERVICE_ORDERS_INTERNAL_API_KEY = 'orders-key';
    process.env.BILLING_SERVICE_URL = 'http://billing.test';
    process.env.BILLING_INTERNAL_API_KEY = 'billing-key';
    finalize.mockResolvedValue(order);
    jest.spyOn(DIContainer, 'getInstance').mockReturnValue({ ensureInitialized: async () => {}, getOrdemServicoGateway: () => ({ finalizeExecution: finalize }), getOrdemServicoController: () => ({ buscarOrdemServicoPorId: async () => ({ id, status: 'FINALIZADA' }) }) } as unknown as DIContainer);
    global.fetch = jest.fn(async () => new Response(null, { status: 204 }));
});
afterEach(() => { jest.restoreAllMocks(); global.fetch = originalFetch; });
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
    expect(finalize).toHaveBeenCalledTimes(2);
});
test('does not notify Billing before execution has finished', async () => {
    finalize.mockResolvedValue(OrdemServico.restore({ id, cpfCnpj:'11144477735', veiculoId:new ObjectId().toString(),status:'RECEBIDA',dataAbertura:new Date(),pecas:[],servicos:[] }));
    await request(app).patch(`/internal/ordensServico/${id}/finalizar`).set('x-internal-api-key','orders-key').expect(409);
    expect(global.fetch).not.toHaveBeenCalled();
});
