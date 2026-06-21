import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { IPecaGateway } from '../../src/application/ports/peca.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const pecasStore = new Map<string, Peca>();

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

DIContainer.getInstance().injectPecaGateway(new InMemoryPecaGateway());

import app from '../../app';

describe('Integração - Rotas de Peças', () => {
    let _token: string;

    beforeAll(async () => {
        _token = await getAuthToken();
    });

    afterEach(() => {
        pecasStore.clear();
    });

    async function criarPecaCustom(data: Record<string, unknown> = {}) {
        const createResponse = await request(app)
            .post('/api/pecas')
            .send({
                nome: 'Peça Teste',
                descricao: 'Descrição teste',
                tipo: 'PECA',
                preco: 100,
                ...data,
            })
            .auth(_token, { type: 'bearer' });

        expect(createResponse.status).toBe(201);

        const listResponse = await request(app)
            .get('/api/pecas')
            .auth(_token, { type: 'bearer' });

        expect(listResponse.status).toBe(200);
        const inserted = listResponse.body.find(
            (item: { nome: string }) => item.nome === createResponse.body.nome
        );
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

        const inserted = listResponse.body.find((item: { nome: string }) => item.nome === 'Cilindro');
        expect(inserted).toBeDefined();

        const getResponse = await request(app)
            .get(`/api/pecas/${inserted.id}`)
            .auth(_token, { type: 'bearer' });
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
            .put(`/api/pecas/${peca.id}`)
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

        const response = await request(app)
            .delete(`/api/pecas/${peca.id}`)
            .auth(_token, { type: 'bearer' });
        expect(response.status).toBe(204);

        const getResponse = await request(app)
            .get(`/api/pecas/${peca.id}`)
            .auth(_token, { type: 'bearer' });
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
