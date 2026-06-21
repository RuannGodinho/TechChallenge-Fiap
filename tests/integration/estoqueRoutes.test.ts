import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { Estoque } from '../../src/enterprise/entities/estoque.entity';
import { MovimentacaoEstoque } from '../../src/enterprise/entities/movimentacao-estoque.entity';
import { IPecaGateway } from '../../src/application/ports/peca.gateway.port';
import { IEstoqueGateway } from '../../src/application/ports/estoque.gateway.port';
import { IMovimentacaoEstoqueGateway } from '../../src/application/ports/movimentacao-estoque.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const pecasStore = new Map<string, Peca>();
const estoqueStore = new Map<string, Estoque>();
const movimentacoesStore: MovimentacaoEstoque[] = [];

class InMemoryPecaGateway implements IPecaGateway {
    async findAll(): Promise<Peca[]> {
        return Array.from(pecasStore.values());
    }

    async findById(id: string): Promise<Peca | null> {
        return pecasStore.get(id) ?? null;
    }

    async save(peca: Peca): Promise<Peca> {
        const id = new ObjectId().toString();
        const saved = new Peca(
            peca.nome,
            peca.descricao,
            peca.preco,
            peca.tipo,
            id,
            peca.quantidade
        );
        pecasStore.set(id, saved);
        return saved;
    }

    async update(id: string, peca: Peca): Promise<Peca | null> {
        if (!pecasStore.has(id)) {
            return null;
        }

        const updated = new Peca(
            peca.nome,
            peca.descricao,
            peca.preco,
            peca.tipo,
            id,
            peca.quantidade
        );
        pecasStore.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return pecasStore.delete(id);
    }
}

class InMemoryEstoqueGateway implements IEstoqueGateway {
    async findAll(): Promise<Estoque[]> {
        return Array.from(estoqueStore.values());
    }

    async findByPecaId(pecaId: string): Promise<Estoque | null> {
        return estoqueStore.get(pecaId) ?? null;
    }

    async save(estoque: Estoque): Promise<Estoque> {
        estoqueStore.set(estoque.pecaId.value, Estoque.restore(estoque.pecaId, estoque.quantidade));
        return estoqueStore.get(estoque.pecaId.value)!;
    }
}

class InMemoryMovimentacaoEstoqueGateway implements IMovimentacaoEstoqueGateway {
    async findAll(): Promise<MovimentacaoEstoque[]> {
        return movimentacoesStore.slice();
    }

    async save(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque> {
        const id = new ObjectId().toString();
        const saved = new MovimentacaoEstoque(
            movimentacao.pecaId,
            movimentacao.tipo,
            movimentacao.quantidade,
            movimentacao.data,
            movimentacao.origem,
            id
        );
        movimentacoesStore.push(saved);
        return saved;
    }
}

const container = DIContainer.getInstance();
container.injectPecaGateway(new InMemoryPecaGateway());
container.injectEstoqueGateway(new InMemoryEstoqueGateway());
container.injectMovimentacaoEstoqueGateway(new InMemoryMovimentacaoEstoqueGateway());

import app from '../../app';

let _token: string;

beforeAll(async () => {
    _token = await getAuthToken();
});

afterEach(() => {
    pecasStore.clear();
    estoqueStore.clear();
    movimentacoesStore.length = 0;
});

describe('Integração - Rotas de Estoque', () => {
    async function criarPeca() {
        const response = await request(app)
            .post('/api/pecas')
            .send({
                nome: 'Peça Teste',
                descricao: 'Descrição teste',
                tipo: 'PECA',
                preco: 50,
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);

        const listResponse = await request(app)
            .get('/api/pecas')
            .auth(_token, { type: 'bearer' });

        expect(listResponse.status).toBe(200);
        const inserted = listResponse.body.find((item: { nome: string }) => item.nome === 'Peça Teste');
        expect(inserted).toBeDefined();
        return inserted.id;
    }

    test('deve registrar entrada e refletir no estoque', async () => {
        const pecaId = await criarPeca();

        const response = await request(app)
            .post('/api/estoque/movimentacoes')
            .send({
                pecaId,
                tipo: 'ENTRADA',
                quantidade: 12,
                origem: 'compra',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body.tipo).toBe('ENTRADA');
        expect(response.body.quantidade).toBe(12);

        const estoqueResponse = await request(app)
            .get(`/api/estoque/${pecaId}`)
            .auth(_token, { type: 'bearer' });
        expect(estoqueResponse.status).toBe(200);
        expect(estoqueResponse.body.quantidade).toBe(12);
    });

    test('deve registrar saída quando houver estoque suficiente', async () => {
        const pecaId = await criarPeca();

        await request(app)
            .post('/api/estoque/movimentacoes')
            .send({
                pecaId,
                tipo: 'ENTRADA',
                quantidade: 8,
                origem: 'compra',
            })
            .auth(_token, { type: 'bearer' });

        const response = await request(app)
            .post('/api/estoque/movimentacoes')
            .send({
                pecaId,
                tipo: 'SAIDA',
                quantidade: 3,
                origem: 'ordem',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body.tipo).toBe('SAIDA');
        expect(response.body.quantidade).toBe(3);

        const estoqueResponse = await request(app)
            .get(`/api/estoque/${pecaId}`)
            .auth(_token, { type: 'bearer' });
        expect(estoqueResponse.status).toBe(200);
        expect(estoqueResponse.body.quantidade).toBe(5);
    });

    test('deve retornar erro ao registrar saída sem estoque', async () => {
        const pecaId = await criarPeca();

        const response = await request(app)
            .post('/api/estoque/movimentacoes')
            .send({
                pecaId,
                tipo: 'SAIDA',
                quantidade: 1,
                origem: 'ordem',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('Não há estoque para a peça especificada');
    });

    test('deve exigir origem ao registrar movimentação', async () => {
        const pecaId = await criarPeca();

        const response = await request(app)
            .post('/api/estoque/movimentacoes')
            .send({
                pecaId,
                tipo: 'ENTRADA',
                quantidade: 5,
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('origem');
    });
});
