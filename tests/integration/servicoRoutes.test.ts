import request from 'supertest';
import app from '../../app';
import { ServicoRepository } from '../../src/Repository/servico-repository';
import { Servico } from '../../src/Entities/servico';
import { getAuthToken } from '../Helper/getAuthToken';

describe('Integração - Rotas de Serviços', () => {
let _token: string;

  beforeAll (async () => {
      _token = await getAuthToken();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve retornar 400 quando dados obrigatórios estiverem ausentes', async () => {
    const response = await request(app)
      .post('/api/servicos')
      .send({ nome: 'Troca de óleo', preco: 249.99 })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'nome, descricao e preco são obrigatórios' });
  });

  test('deve criar serviço com sucesso', async () => {
    jest.spyOn(ServicoRepository.prototype, 'createServico').mockResolvedValue();

    const response = await request(app)
      .post('/api/servicos')
      .send({ nome: 'Troca de óleo', descricao: 'Troca de óleo completo com filtro', preco: 249.99 })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ nome: 'Troca de óleo', descricao: 'Troca de óleo completo com filtro', preco: 249.99 });
  });

  test('deve retornar 404 ao buscar serviço inexistente', async () => {
    jest.spyOn(ServicoRepository.prototype, 'getServicoById').mockResolvedValue(null);

    const response = await request(app).get('/api/servicos/id-inexistente').auth(_token, { type: 'bearer' });;

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service not found' });
  });

  test('deve retornar 404 ao atualizar serviço inexistente', async () => {
    jest.spyOn(ServicoRepository.prototype, 'getServicoById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/servicos/id-inexistente')
      .send({ nome: 'Troca de óleo', descricao: 'Troca de óleo completo com filtro', preco: 249.99 })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service not found' });
  });

  test('deve retornar 204 ao deletar serviço existente', async () => {
    const existingServico = new Servico('Troca de óleo', 'Troca de óleo completo com filtro', 249.99);
    jest.spyOn(ServicoRepository.prototype, 'getServicoById').mockResolvedValue(existingServico);
    jest.spyOn(ServicoRepository.prototype, 'deleteServico').mockResolvedValue();

    const response = await request(app).delete('/api/servicos/existing-id').auth(_token, { type: 'bearer' });;

    expect(response.status).toBe(204);
  });
});
