import request from 'supertest';
import app from '../../app';
import { getAuthToken } from '../Helper/getAuthToken';
import { ExecucaoServicoRepository } from '../../src/Repository/execucao-servico-repository';
import { ObjectId } from 'mongodb';

describe('Integração - Rotas de Execução de Serviço', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve validar criação manual de execução de serviço', async () => {
    const response = await request(app)
      .post('/api/execucoes-servico')
      .send({ ordemServicoId: new ObjectId().toString() })
      .auth(token, { type: 'bearer' });

    expect([400, 404, 500]).toContain(response.status);
  });

  test('deve retornar 404 ao iniciar execução inexistente', async () => {
    jest.spyOn(ExecucaoServicoRepository.prototype, 'getExecucaoById').mockResolvedValue(null as any);

    const response = await request(app)
      .patch(`/api/execucoes-servico/${new ObjectId().toString()}/iniciar`)
      .auth(token, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/não encontrada/);
  });

  test('deve retornar métricas de tempo médio com sucesso', async () => {
    jest.spyOn(ExecucaoServicoRepository.prototype, 'getExecucoesFinalizadas').mockResolvedValue([] as any);

    const response = await request(app)
      .get('/api/metricas/tempo-medio-servicos')
      .auth(token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tempoMedioMinutos');
    expect(response.body).toHaveProperty('totalServicosFinalizados');
  });
});
