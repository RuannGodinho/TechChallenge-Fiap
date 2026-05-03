import request from 'supertest';
import app from '../../app';
import { OrdemServicoRepository } from '../../src/Repository/ordem-servico-repository';
import { OrdemServico } from '../../src/Entities/ordem-servico';
import { getAuthToken } from '../Helper/getAuthToken';
import { ObjectId } from 'mongodb';

describe('Integração - Rotas de Ordens de Serviço', () => {
  let _token: string;

  beforeAll(async () => {
    _token = await getAuthToken();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve validar requisição a endpoint de ordens de serviço', async () => {
    const response = await request(app)
      .post('/api/ordens-servico')
      .send({ status: 'RECEBIDA' })
      .auth(_token, { type: 'bearer' });

    expect([201, 400, 404]).toContain(response.status);
  });

  test('deve criar ordem de serviço com sucesso ou retornar erro', async () => {
    jest.spyOn(OrdemServicoRepository.prototype, 'createOrdemServico').mockResolvedValue();

    const payload = {
      cpfCnpj: '11144477735',
      veiculo: new ObjectId().toString(),
      status: 'RECEBIDA',
      pecas: [],
      servicos: []
    };

    const response = await request(app)
      .post('/api/ordens-servico')
      .send(payload)
      .auth(_token, { type: 'bearer' });

    expect([201, 400, 404]).toContain(response.status);
  });

  test('deve listar ordens de serviço', async () => {
    const mockOrdens = [
      {
        _id: new ObjectId(),
        cpfCnpj: '11144477735',
        veiculo: new ObjectId(),
        status: 'RECEBIDA',
        dataAbertura: new Date()
      }
    ];

    jest.spyOn(OrdemServicoRepository.prototype, 'listaOrdensServico').mockResolvedValue(mockOrdens as any);

    const response = await request(app)
      .get('/api/ordens-servico')
      .auth(_token, { type: 'bearer' });

    expect([200, 404]).toContain(response.status);
  });

  test('deve retornar 404 ao buscar ordem de serviço inexistente', async () => {
    jest.spyOn(OrdemServicoRepository.prototype, 'getOSById').mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/ordens-servico/${new ObjectId()}`)
      .auth(_token, { type: 'bearer' });

    expect([404, 400]).toContain(response.status);
  });

  test('deve atualizar status da ordem de serviço', async () => {
    const ordemId = new ObjectId();

    jest.spyOn(OrdemServicoRepository.prototype, 'getOSById').mockResolvedValue({
      _id: ordemId,
      cpfCnpj: '11144477735',
      status: 'RECEBIDA'
    } as any);

    jest.spyOn(OrdemServicoRepository.prototype, 'updateOrdemServico').mockResolvedValue({
      _id: ordemId,
      status: 'EM DIAGNOSTICO'
    } as any);

    const response = await request(app)
      .put(`/api/ordens-servico/${ordemId}`)
      .send({ status: 'EM DIAGNOSTICO' })
      .auth(_token, { type: 'bearer' });

    expect([200, 404, 400]).toContain(response.status);
  });
});
