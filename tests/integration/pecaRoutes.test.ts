import request from 'supertest';
import { ObjectId } from 'mongodb';
import { getAuthToken } from '../Helper/getAuthToken';

const pecasStore = new Map<string, any>();

jest.mock('../../src/Repository/PecaRepository', () => ({
  PecaRepository: jest.fn().mockImplementation(() => ({
    getAllPecas: jest.fn(async () => Array.from(pecasStore.values())),
    getPecaById: jest.fn(async (id: string | ObjectId) => {
      const key = id instanceof ObjectId ? id.toString() : id.toString();
      return pecasStore.get(key) || null;
    }),
    createPeca: jest.fn(async (peca: any) => {
      const id = new ObjectId().toString();
      pecasStore.set(id, { ...peca, _id: id });
    }),
    updatePeca: jest.fn(async (id: string | ObjectId, peca: any) => {
      const key = id instanceof ObjectId ? id.toString() : id.toString();
      const existing = pecasStore.get(key);
      if (!existing) return;
      pecasStore.set(key, { ...existing, ...peca, _id: key });
    }),
    deletePeca: jest.fn(async (id: string | ObjectId) => {
      const key = id instanceof ObjectId ? id.toString() : id.toString();
      return pecasStore.delete(key);
    }),
  })),
}));

import app from '../../app';

let _token: string;

beforeAll(async () => {
  _token = await getAuthToken();
});

afterEach(() => {
  pecasStore.clear();
  jest.clearAllMocks();
});


describe('Integração - Rotas de Peças', () => {

  async function criarPecaCustom(data: any = {}) {
    const createResponse = await request(app)
      .post('/api/pecas')
      .send({
        nome: 'Peça Teste',
        descricao: 'Descrição teste',
        tipo: 'PECA',
        preco: 100,
        ...data
      })
      .auth(_token, { type: 'bearer' });

    expect(createResponse.status).toBe(201);

    const listResponse = await request(app)
      .get('/api/pecas')
      .auth(_token, { type: 'bearer' });

    expect(listResponse.status).toBe(200);
    const inserted = listResponse.body.find((item: any) => item.nome === createResponse.body.nome);
    expect(inserted).toBeDefined();
    return inserted;
  }

  test('deve criar peça e depois recuperá-la', async () => {
    const createResponse = await request(app)
      .post('/api/pecas')
      .send({
        nome: 'Cilindro',
        descricao: 'Cilindro de freio',
        tipo: 'PECA',
        preco: 159.9,
      })
      .auth(_token, { type: 'bearer' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      nome: 'Cilindro',
      descricao: 'Cilindro de freio',
      tipo: 'PECA',
      preco: 159.9,
    });

    const listResponse = await request(app).get('/api/pecas').auth(_token, { type: 'bearer' });
    expect(listResponse.status).toBe(200);

    const inserted = listResponse.body.find((item: any) => item.nome === 'Cilindro');
    expect(inserted).toBeDefined();

    const getResponse = await request(app).get(`/api/pecas/${inserted._id}`).auth(_token, { type: 'bearer' });
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.nome).toBe('Cilindro');
  });

  test('deve rejeitar criação de peça com tipo inválido', async () => {
    const response = await request(app)
      .post('/api/pecas')
      .send({
        nome: 'Filtro',
        descricao: 'Filtro de ar',
        tipo: 'INVALIDO',
        preco: 49.9,
      })
      .auth(_token, { type: 'bearer' });
    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Tipo inválido. Use PECA ou INSUMO');
  });

  test('deve atualizar peça existente', async () => {
    const peca = await criarPecaCustom({
      nome: 'Amortecedor',
      descricao: 'Amortecedor dianteiro',
      preco: 299.9,
    });

    const response = await request(app)
      .put(`/api/pecas/${peca._id}`)
      .send({
        nome: 'Amortecedor Premium',
        descricao: 'Amortecedor dianteiro atualizado',
        tipo: 'INSUMO',
        preco: 329.9,
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      nome: 'Amortecedor Premium',
      tipo: 'INSUMO',
    });
  });

  test('deve deletar peça existente', async () => {
    const peca = await criarPecaCustom({
      nome: 'Pastilha',
      descricao: 'Pastilha de freio',
      preco: 89.9,
    });

    const response = await request(app).delete(`/api/pecas/${peca._id}`).auth(_token, { type: 'bearer' });
    expect(response.status).toBe(204);

    const getResponse = await request(app).get(`/api/pecas/${peca._id}`).auth(_token, { type: 'bearer' });
    expect(getResponse.status).toBe(404);
  });

  test('deve retornar 400 ao usar id inválido de rota', async () => {
    const response = await request(app)
      .put('/api/pecas/:id')
      .send({ nome: 'Novo Nome' })
      .auth(_token, { type: 'bearer' });
      
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID da peça é obrigatório' });
  });
});
