import request from 'supertest';
import app from '../../app';
import { connectDatabase, closeDatabase } from '../../src/config/database';

let db: any;

beforeAll(async () => {
  db = await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await db.collection('Pecas').deleteMany({});
  await db.collection('Estoque').deleteMany({});
  await db.collection('MovimentacoesEstoque').deleteMany({});
});

describe('Integração - Rotas de Peças', () => {

  async function criarPecaCustom(data: any = {}) {
    const response = await request(app)
      .post('/api/pecas')
      .send({
        Nome: 'Peça Teste',
        Descricao: 'Descrição teste',
        Tipo: 'PECA',
        Preco: 100,
        ...data
      });

    expect(response.status).toBe(201);

    return response.body;
  }

  test('deve criar peça e depois recuperá-la', async () => {
    const createResponse = await request(app)
      .post('/api/pecas')
      .send({
        Nome: 'Cilindro',
        Descricao: 'Cilindro de freio',
        Tipo: 'PECA',
        Preco: 159.9,
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      Nome: 'Cilindro',
      Descricao: 'Cilindro de freio',
      Tipo: 'PECA',
      Preco: 159.9,
    });

    const listResponse = await request(app).get('/api/pecas');
    expect(listResponse.status).toBe(200);

    const inserted = listResponse.body.find((item: any) => item.Nome === 'Cilindro');
    expect(inserted).toBeDefined();

    const getResponse = await request(app).get(`/api/pecas/${inserted._id}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.Nome).toBe('Cilindro');
  });

  test('deve rejeitar criação de peça com tipo inválido', async () => {
    const response = await request(app)
      .post('/api/pecas')
      .send({
        Nome: 'Filtro',
        Descricao: 'Filtro de ar',
        Tipo: 'INVALIDO',
        Preco: 49.9,
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Tipo inválido. Use PECA ou INSUMO');
  });

  test('deve atualizar peça existente', async () => {
    const peca = await criarPecaCustom({
      Nome: 'Amortecedor',
      Descricao: 'Amortecedor dianteiro',
      Preco: 299.9,
    });

    const response = await request(app)
      .put(`/api/pecas/${peca._id}`)
      .send({
        Nome: 'Amortecedor Premium',
        Descricao: 'Amortecedor dianteiro atualizado',
        Tipo: 'INSUMO',
        Preco: 329.9,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      Nome: 'Amortecedor Premium',
      Tipo: 'INSUMO',
    });
  });

  test('deve deletar peça existente', async () => {
    const peca = await criarPecaCustom({
      Nome: 'Pastilha',
      Descricao: 'Pastilha de freio',
      Preco: 89.9,
    });

    const response = await request(app).delete(`/api/pecas/${peca._id}`);
    expect(response.status).toBe(204);

    const getResponse = await request(app).get(`/api/pecas/${peca._id}`);
    expect(getResponse.status).toBe(404);
  });

  test('deve retornar 400 ao usar id inválido de rota', async () => {
    const response = await request(app)
      .put('/api/pecas/:id')
      .send({ Nome: 'Novo Nome' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID da peça é obrigatório' });
  });
});