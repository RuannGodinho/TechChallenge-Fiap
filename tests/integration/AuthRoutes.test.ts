import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../src/application/ports/cliente.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';

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
        const id = cliente.id ?? new ObjectId().toString();
        const saved = new Cliente(
            cliente.nome,
            cliente.email,
            cliente.documento,
            cliente.telefone,
            id,
            cliente.status
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
            id,
            cliente.status
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

const ATIVO_CPF = '81788455045';
const INATIVO_CPF = '52263606068';

describe('Integração - Rotas de Autenticação', () => {
    beforeEach(async () => {
        clientesStore.clear();
        const gateway = DIContainer.getInstance().getClienteGateway();
        await gateway.save(
            Cliente.create('Ruann Godinho', 'ruann@gmail.com', ATIVO_CPF, '15997653816')
        );
        await gateway.save(
            Cliente.create(
                'João Pereira',
                'joao@gmail.com',
                INATIVO_CPF,
                '11995553322',
                'INATIVO'
            )
        );
    });

    test('deve retornar token ao fazer login com CPF ativo', async () => {
        const response = await request(app).post('/api/login').send({ cpf: ATIVO_CPF });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe('string');
    });

    test('deve retornar 401 quando o cliente nao existe', async () => {
        const response = await request(app).post('/api/login').send({ cpf: '81421981009' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Cliente não encontrado');
    });

    test('deve retornar 403 quando o cliente esta inativo', async () => {
        const response = await request(app).post('/api/login').send({ cpf: INATIVO_CPF });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Cliente inativo');
    });

    test('deve retornar 400 quando o CPF e invalido', async () => {
        const response = await request(app).post('/api/login').send({ cpf: '00000000000' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('CPF inválido');
    });

    test('deve acessar rota protegida com token valido', async () => {
        const loginResponse = await request(app).post('/api/login').send({ cpf: ATIVO_CPF });

        const response = await request(app)
            .get('/api/me')
            .set('Authorization', `Bearer ${loginResponse.body.token}`);

        expect(response.status).toBe(200);
        expect(response.body.user.cpf).toBe(ATIVO_CPF);
        expect(response.body.user.email).toBe('ruann@gmail.com');
    });

    test('deve expor lookup interno com gateway trust para a Lambda', async () => {
        const response = await request(app)
            .get(`/api/internal/auth/clientes/${ATIVO_CPF}`)
            .set('x-gateway-trust', 'test-trust-secret');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            cpf: ATIVO_CPF,
            email: 'ruann@gmail.com',
            status: 'ATIVO',
        });
    });

    test('deve recusar rota protegida com token invalido', async () => {
        const response = await request(app)
            .get('/api/me')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token inválido');
    });
});
