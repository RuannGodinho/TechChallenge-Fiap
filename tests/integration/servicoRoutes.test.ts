import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { IServicoGateway } from '../../src/application/ports/servico.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const servicosStore = new Map<string, Servico>();

class InMemoryServicoGateway implements IServicoGateway {
    async findAll(): Promise<Servico[]> {
        return Array.from(servicosStore.values());
    }

    async findById(id: string): Promise<Servico | null> {
        return servicosStore.get(id) ?? null;
    }

    async save(servico: Servico): Promise<Servico> {
        const id = new ObjectId().toString();
        const saved = new Servico(
            servico.nome,
            servico.descricao,
            servico.preco,
            id,
            servico.quantidade
        );
        servicosStore.set(id, saved);
        return saved;
    }

    async update(id: string, servico: Servico): Promise<Servico | null> {
        if (!servicosStore.has(id)) {
            return null;
        }

        const updated = new Servico(
            servico.nome,
            servico.descricao,
            servico.preco,
            id,
            servico.quantidade
        );
        servicosStore.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return servicosStore.delete(id);
    }
}

DIContainer.getInstance().injectServicoGateway(new InMemoryServicoGateway());

import app from '../../app';

describe('Integração - Rotas de Serviços', () => {
    let _token: string;

    beforeAll(async () => {
        _token = await getAuthToken();
    });

    afterEach(() => {
        servicosStore.clear();
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
        const response = await request(app)
            .post('/api/servicos')
            .send({
                nome: 'Troca de óleo',
                descricao: 'Troca de óleo completo com filtro',
                preco: 249.99,
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            nome: 'Troca de óleo',
            descricao: 'Troca de óleo completo com filtro',
            preco: 249.99,
        });
    });

    test('deve retornar 404 ao buscar serviço inexistente', async () => {
        const response = await request(app)
            .get('/api/servicos/id-inexistente')
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Service not found' });
    });

    test('deve retornar 404 ao atualizar serviço inexistente', async () => {
        const response = await request(app)
            .put('/api/servicos/id-inexistente')
            .send({
                nome: 'Troca de óleo',
                descricao: 'Troca de óleo completo com filtro',
                preco: 249.99,
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Service not found' });
    });

    test('deve retornar 204 ao deletar serviço existente', async () => {
        const createResponse = await request(app)
            .post('/api/servicos')
            .send({
                nome: 'Troca de óleo',
                descricao: 'Troca de óleo completo com filtro',
                preco: 249.99,
            })
            .auth(_token, { type: 'bearer' });

        const id = createResponse.body.id;

        const response = await request(app)
            .delete(`/api/servicos/${id}`)
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(204);
    });
});
