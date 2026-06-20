import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { Placa } from '../../src/enterprise/value-objects/placa.vo';
import { IVeiculoGateway } from '../../src/application/ports/veiculo.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const veiculosStore = new Map<string, Veiculo>();

class InMemoryVeiculoGateway implements IVeiculoGateway {
    async findAll(): Promise<Veiculo[]> {
        return Array.from(veiculosStore.values());
    }

    async findById(id: string): Promise<Veiculo | null> {
        return veiculosStore.get(id) ?? null;
    }

    async findByPlaca(placa: Placa): Promise<Veiculo | null> {
        return (
            Array.from(veiculosStore.values()).find(
                (veiculo) => veiculo.placa.value === placa.value
            ) ?? null
        );
    }

    async save(veiculo: Veiculo): Promise<Veiculo> {
        const id = new ObjectId().toString();
        const saved = new Veiculo(
            veiculo.placa,
            veiculo.modelo,
            veiculo.ano,
            veiculo.marca,
            id
        );
        veiculosStore.set(id, saved);
        return saved;
    }

    async update(id: string, veiculo: Veiculo): Promise<Veiculo | null> {
        if (!veiculosStore.has(id)) {
            return null;
        }

        const updated = new Veiculo(
            veiculo.placa,
            veiculo.modelo,
            veiculo.ano,
            veiculo.marca,
            id
        );
        veiculosStore.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return veiculosStore.delete(id);
    }
}

DIContainer.getInstance().injectVeiculoGateway(new InMemoryVeiculoGateway());

import app from '../../app';

describe('Integração - Rotas de Veículos', () => {
    let _token: string;

    beforeAll(async () => {
        _token = await getAuthToken();
    });

    afterEach(() => {
        veiculosStore.clear();
    });

    test('deve retornar 400 quando dados obrigatórios estiverem ausentes', async () => {
        const response = await request(app)
            .post('/api/veiculos')
            .send({ modelo: 'Civic', ano: 2022, marca: 'Honda' })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'placa, modelo, ano e marca são obrigatórios' });
    });

    test('deve criar veículo com sucesso', async () => {
        const response = await request(app)
            .post('/api/veiculos')
            .send({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            placa: 'ABC1234',
            modelo: 'Civic',
            ano: 2022,
            marca: 'Honda',
        });
    });

    test('deve retornar 404 ao buscar veículo inexistente', async () => {
        const response = await request(app)
            .get('/api/veiculos/id-inexistente')
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Veiculo not found' });
    });

    test('deve retornar 404 ao atualizar veículo inexistente', async () => {
        const response = await request(app)
            .put('/api/veiculos/id-inexistente')
            .send({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Veiculo not found' });
    });

    test('deve retornar 204 ao deletar veículo existente', async () => {
        const createResponse = await request(app)
            .post('/api/veiculos')
            .send({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' })
            .auth(_token, { type: 'bearer' });

        const id = createResponse.body.id;

        const response = await request(app)
            .delete(`/api/veiculos/${id}`)
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(204);
    });
});
