import request from 'supertest';
import { ObjectId } from 'mongodb';
import { getAuthToken } from '../Helper/getAuthToken';

const pecasStore = new Map<string, any>();
const estoqueStore = new Map<string, any>();
const movimentacoesStore: any[] = [];

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

jest.mock('../../src/Repository/EstoqueRepository', () => ({
  EstoqueRepository: jest.fn().mockImplementation(() => ({
    getAllEstoque: jest.fn(async () => Array.from(estoqueStore.values())),
    getEstoqueByPecaId: jest.fn(async (pecaId: string | ObjectId) => {
      const key = pecaId instanceof ObjectId ? pecaId.toString() : pecaId.toString();
      return estoqueStore.get(key) || null;
    }),
    createEstoque: jest.fn(async (estoque: any) => {
      const key = estoque.pecaId instanceof ObjectId ? estoque.pecaId.toString() : estoque.pecaId.toString();
      estoqueStore.set(key, { ...estoque, pecaId: key });
    }),
    updateEstoque: jest.fn(async (pecaId: string | ObjectId, quantidade: number) => {
      const key = pecaId instanceof ObjectId ? pecaId.toString() : pecaId.toString();
      const existing = estoqueStore.get(key);
      if (!existing) return;
      estoqueStore.set(key, { ...existing, quantidade: quantidade });
    }),
    deleteEstoque: jest.fn(async (pecaId: string | ObjectId) => {
      const key = pecaId instanceof ObjectId ? pecaId.toString() : pecaId.toString();
      return estoqueStore.delete(key);
    }),
  })),
}));

jest.mock('../../src/Repository/MovimentacaoEstoqueRepository', () => ({
  MovimentacaoEstoqueRepository: jest.fn().mockImplementation(() => ({
    createMovimentacao: jest.fn(async (movimentacao: any) => {
      movimentacoesStore.push({ ...movimentacao, pecaId: movimentacao.pecaId.toString() });
    }),
    listaMovimentacoes: jest.fn(async () => movimentacoesStore.slice()),
  })),
}));

import app from '../../app';

let _token: string;

beforeAll(async () => {
  _token = await getAuthToken();
});

afterEach(() => {
  pecasStore.clear();
  estoqueStore.clear();
  movimentacoesStore.length = 0;
  jest.clearAllMocks();
});

describe('Integração - Rotas de Estoque', () => {

  async function criarPeca() {
    const response = await request(app)
      .post('/api/pecas')
      .send({
        nome: 'Peça Teste',
        descricao: 'Descrição teste',
        tipo: 'PECA',
        preco: 50
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);

    const listResponse = await request(app)
      .get('/api/pecas')
      .auth(_token, { type: 'bearer' });

    expect(listResponse.status).toBe(200);
    const inserted = listResponse.body.find((item: any) => item.nome === 'Peça Teste');
    expect(inserted).toBeDefined();
    return inserted._id;
  }

  test('deve registrar entrada e refletir no estoque', async () => {
    const pecaId = await criarPeca();

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        pecaId: pecaId,
        tipo: 'ENTRADA',
        quantidade: 12,
        origem: 'compra',
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe('ENTRADA');
    expect(response.body.quantidade).toBe(12);

    const estoqueResponse = await request(app).get(`/api/estoque/${pecaId}`).auth(_token, { type: 'bearer' });
    expect(estoqueResponse.status).toBe(200);
    expect(estoqueResponse.body.quantidade).toBe(12);
  });

  test('deve registrar saída quando houver estoque suficiente', async () => {
    const pecaId = await criarPeca();

    // cria entrada antes (via rota!)
    await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        pecaId: pecaId,
        tipo: 'ENTRADA',
        quantidade: 8,
        origem: 'compra',
      })
      .auth(_token, { type: 'bearer' });

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        pecaId: pecaId,
        tipo: 'SAIDA',
        quantidade: 3,
        origem: 'ordem',
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe('SAIDA');
    expect(response.body.quantidade).toBe(3);

    const estoqueResponse = await request(app).get(`/api/estoque/${pecaId}`).auth(_token, { type: 'bearer' });
    expect(estoqueResponse.status).toBe(200);
    expect(estoqueResponse.body.quantidade).toBe(5);
  });

  test('deve retornar erro ao registrar saída sem estoque', async () => {
    const pecaId = await criarPeca();

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        pecaId: pecaId,
        tipo: 'SAIDA',
        quantidade: 1,
        origem: 'ordem',
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Não há estoque para a peça especificada');
  });

  test('deve excluir estoque existente e não encontrar depois', async () => {
    const pecaId = await criarPeca();

    // cria estoque via entrada
    await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        pecaId: pecaId,
        tipo: 'ENTRADA',
        quantidade: 20,
        origem: 'compra',
      })
      .auth(_token, { type: 'bearer' });

    const deleteResponse = await request(app).delete(`/api/estoque/${pecaId}`).auth(_token, { type: 'bearer' });
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/api/estoque/${pecaId}`).auth(_token, { type: 'bearer' });
    expect(getResponse.status).toBe(404);
  });
});