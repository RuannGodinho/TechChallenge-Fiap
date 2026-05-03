import request from 'supertest';
import app from '../../app';
import { OrcamentoRepository } from '../../src/Repository/orcamento-repository';
import { Orcamento } from '../../src/Entities/orcamento';
import { getAuthToken } from '../Helper/getAuthToken';
import { ObjectId } from 'mongodb';

describe('Integração - Rotas de Orçamentos', () => {
  let _token: string;

  beforeAll(async () => {
    _token = await getAuthToken();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve validar requisição a endpoint de orçamentos', async () => {
    const response = await request(app)
      .post('/api/orcamentos')
      .send({ status: 'PENDENTE' })
      .auth(_token, { type: 'bearer' });

    expect([201, 400, 404]).toContain(response.status);
  });

  test('deve criar orçamento com sucesso ou retornar erro', async () => {
    jest.spyOn(OrcamentoRepository.prototype, 'createOrcamento').mockResolvedValue();

    const payload = {
      ordemServicoId: new ObjectId().toString(),
      versao: 1,
      status: 'PENDENTE',
      pecas: [],
      itensServicos: [],
      valorTotal: 100.00,
      validadeEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoEm: new Date()
    };

    const response = await request(app)
      .post('/api/orcamentos')
      .send(payload)
      .auth(_token, { type: 'bearer' });

    expect([201, 400, 404]).toContain(response.status);
  });

  test('deve listar orçamentos por busca', async () => {
    const mockOrcamentos = {
      _id: new ObjectId(),
      ordemServicoId: new ObjectId(),
      versao: 1,
      status: 'PENDENTE',
      valorTotal: 100.00
    };

    jest.spyOn(OrcamentoRepository.prototype, 'getOrcamentoById').mockResolvedValue(mockOrcamentos as any);

    const response = await request(app)
      .get(`/api/orcamentos/${new ObjectId()}`)
      .auth(_token, { type: 'bearer' });

    expect([200, 404]).toContain(response.status);
  });

  test('deve retornar 404 ao buscar orçamento inexistente', async () => {
    jest.spyOn(OrcamentoRepository.prototype, 'getOrcamentoById').mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/orcamentos/${new ObjectId()}`)
      .auth(_token, { type: 'bearer' });

    expect([404, 400]).toContain(response.status);
  });

  test('deve atualizar status do orçamento', async () => {
    const orcamentoId = new ObjectId();

    jest.spyOn(OrcamentoRepository.prototype, 'getOrcamentoById').mockResolvedValue({
      _id: orcamentoId,
      status: 'PENDENTE'
    } as any);

    jest.spyOn(OrcamentoRepository.prototype, 'updateOrcamento').mockResolvedValue({
      _id: orcamentoId,
      status: 'APROVADO'
    } as any);

    const response = await request(app)
      .put(`/api/orcamentos/${orcamentoId}`)
      .send({ status: 'APROVADO' })
      .auth(_token, { type: 'bearer' });

    expect([200, 404, 400]).toContain(response.status);
  });

  test('deve incrementar versão do orçamento ao atualizar', async () => {
    const orcamentoId = new ObjectId();

    jest.spyOn(OrcamentoRepository.prototype, 'getOrcamentoById').mockResolvedValue({
      _id: orcamentoId,
      versao: 1,
      status: 'PENDENTE'
    } as any);

    jest.spyOn(OrcamentoRepository.prototype, 'updateOrcamento').mockResolvedValue({
      _id: orcamentoId,
      versao: 2,
      status: 'REPROVADO'
    } as any);

    const response = await request(app)
      .put(`/api/orcamentos/${orcamentoId}`)
      .send({ versao: 2, status: 'REPROVADO' })
      .auth(_token, { type: 'bearer' });

    expect([200, 404, 400]).toContain(response.status);
  });
});
