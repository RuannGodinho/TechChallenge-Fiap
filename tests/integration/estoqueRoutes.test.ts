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

describe('Integração - Rotas de Estoque', () => {

  async function criarPeca() {
    const response = await request(app)
      .post('/api/pecas')
      .send({
        Nome: 'Peça Teste',
        Descricao: 'Descrição teste',
        Tipo: 'PECA',
        Preco: 50
      });

    expect(response.status).toBe(201);

    return response.body._id; // ajuste se seu retorno for diferente
  }

  test('deve registrar entrada e refletir no estoque', async () => {
    const pecaId = await criarPeca();

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        PecaId: pecaId,
        Tipo: 'ENTRADA',
        Quantidade: 12,
        Origem: 'compra',
      });

    expect(response.status).toBe(201);
    expect(response.body.Tipo).toBe('ENTRADA');
    expect(response.body.Quantidade).toBe(12);

    const estoqueResponse = await request(app).get(`/api/estoque/${pecaId}`);
    expect(estoqueResponse.status).toBe(200);
    expect(estoqueResponse.body.Quantidade).toBe(12);
  });

  test('deve registrar saída quando houver estoque suficiente', async () => {
    const pecaId = await criarPeca();

    // cria entrada antes (via rota!)
    await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        PecaId: pecaId,
        Tipo: 'ENTRADA',
        Quantidade: 8,
        Origem: 'compra',
      });

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        PecaId: pecaId,
        Tipo: 'SAIDA',
        Quantidade: 3,
        Origem: 'ordem',
      });

    expect(response.status).toBe(201);
    expect(response.body.Tipo).toBe('SAIDA');
    expect(response.body.Quantidade).toBe(3);

    const estoqueResponse = await request(app).get(`/api/estoque/${pecaId}`);
    expect(estoqueResponse.status).toBe(200);
    expect(estoqueResponse.body.Quantidade).toBe(5);
  });

  test('deve retornar erro ao registrar saída sem estoque', async () => {
    const pecaId = await criarPeca();

    const response = await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        PecaId: pecaId,
        Tipo: 'SAIDA',
        Quantidade: 1,
        Origem: 'ordem',
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Não há estoque para a peça especificada');
  });

  test('deve excluir estoque existente e não encontrar depois', async () => {
    const pecaId = await criarPeca();

    // cria estoque via entrada
    await request(app)
      .post('/api/estoque/movimentacoes')
      .send({
        PecaId: pecaId,
        Tipo: 'ENTRADA',
        Quantidade: 20,
        Origem: 'compra',
      });

    const deleteResponse = await request(app).delete(`/api/estoque/${pecaId}`);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/api/estoque/${pecaId}`);
    expect(getResponse.status).toBe(404);
  });
});