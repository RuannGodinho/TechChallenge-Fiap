import request from 'supertest';
import app from '../../app';

// The original functional contracts are now tested in their owning microservice.
test.each([
    ['get', '/api/execucoes-servico/123'],
    ['patch', '/api/execucoes-servico/123/iniciar'],
    ['patch', '/api/execucoes-servico/123/finalizar'],
    ['get', '/api/metricas/tempo-medio-servicos']
] as const)('Service Orders does not own %s %s', async (method, path) => {
    const response = await request(app)[method](path).send({});
    expect(response.status).toBe(404);
});
