import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../src/application/ports/cliente.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const clientesStore = new Map<string, Cliente>();

class InMemoryClienteGateway implements IClienteGateway {
    async findAll(): Promise<Cliente[]> {
        return Array.from(clientesStore.values());
    }

    async findById(id: string): Promise<Cliente | null> {
        return clientesStore.get(id) ?? null;
    }

    async findByDocumento(documento: Documento): Promise<Cliente | null> {
        return (
            Array.from(clientesStore.values()).find(
                (cliente) => cliente.documento.value === documento.value
            ) ?? null
        );
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const id = new ObjectId().toString();
        const saved = new Cliente(
            cliente.nome,
            cliente.email,
            cliente.documento,
            cliente.telefone,
            id
        );
        clientesStore.set(id, saved);
        return saved;
    }

    async update(id: string, cliente: Cliente): Promise<Cliente | null> {
        if (!clientesStore.has(id)) {
            return null;
        }

        const updated = new Cliente(
            cliente.nome,
            cliente.email,
            cliente.documento,
            cliente.telefone,
            id
        );
        clientesStore.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return clientesStore.delete(id);
    }
}

DIContainer.getInstance().injectClienteGateway(new InMemoryClienteGateway());

import app from '../../app';

describe('Integração - Rotas de Clientes', () => {
    let _token: string;

    beforeAll(async () => {
        _token = await getAuthToken();
    });

    afterEach(() => {
        clientesStore.clear();
    });

    test('deve retornar 400 quando dados obrigatórios estiverem ausentes', async () => {
        const response = await request(app)
            .post('/api/clientes')
            .send({
                nome: 'Cliente Teste',
                email: 'teste@email.com',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'nome, email, cpf/cnpj e telefone são obrigatórios',
        });
    });

    test('deve criar cliente com sucesso', async () => {
        const response = await request(app)
            .post('/api/clientes')
            .send({
                nome: 'Ruann Godinho',
                email: 'ruann@email.com',
                cpf: '092.912.010-81',
                telefone: '11999999999',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            nome: 'Ruann Godinho',
            email: 'ruann@email.com',
            cpf: '092.912.010-81',
        });
    });

    test('deve buscar cliente por CPF', async () => {
        const createResponse = await request(app)
            .post('/api/clientes')
            .send({
                nome: 'Cliente CPF',
                email: 'cpf@email.com',
                cpf: '111.444.777-35',
                telefone: '11988887777',
            })
            .auth(_token, { type: 'bearer' });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.cpf).toBe('111.444.777-35');

        const response = await request(app)
            .get('/api/clientes/cpf/111.444.777-35')
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            nome: 'Cliente CPF',
            email: 'cpf@email.com',
            cpf: '111.444.777-35',
        });
    });

    test('deve rejeitar CPF inválido', async () => {
        const response = await request(app)
            .post('/api/clientes')
            .send({
                nome: 'Cliente Inválido',
                email: 'invalido@email.com',
                cpf: '00000000000',
                telefone: '11999999999',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('Erro ao criar cliente:CPF/CNPJ inválido');
    });

    test('deve listar clientes', async () => {
        const response = await request(app).get('/api/clientes').auth(_token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('deve buscar cliente por id inexistente', async () => {
        const response = await request(app)
            .get('/api/clientes/id-inexistente')
            .auth(_token, { type: 'bearer' });

        expect([400, 404, 500]).toContain(response.status);
    });

    test('deve atualizar cliente inexistente', async () => {
        const response = await request(app)
            .put('/api/clientes/:id')
            .send({
                nome: 'Novo Nome',
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'ID do cliente é obrigatório',
        });
    });

    test('deve deletar cliente inexistente', async () => {
        const response = await request(app)
            .delete('/api/clientes/:id')
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'ID do cliente é obrigatório',
        });
    });
});
