import request from 'supertest';
import app from '../../app';
import { VeiculoRepository } from '../../src/Repository/VeiculoRepository';
import { Veiculo } from '../../src/Entities/Veiculo';
import { getAuthToken } from '../Helper/getAuthToken';

describe('Integração - Rotas de Veículos', () => {
  let _token: string;
  
    beforeAll (async () => {
        _token = await getAuthToken();
    });

  afterEach(() => {
    jest.restoreAllMocks();
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
    jest.spyOn(VeiculoRepository.prototype, 'criarVeiculo').mockResolvedValue();

    const response = await request(app)
      .post('/api/veiculos')
      .send({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' });
  });

  test('deve retornar 404 ao buscar veículo inexistente', async () => {
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(null);

    const response = await request(app).get('/api/veiculos/id-inexistente').auth(_token, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Veiculo not found' });
  });

  test('deve retornar 404 ao atualizar veículo inexistente', async () => {
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/veiculos/id-inexistente')
      .send({ placa: 'ABC1234', modelo: 'Civic', ano: 2022, marca: 'Honda' })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Veiculo not found' });
  });

  test('deve retornar 204 ao deletar veículo existente', async () => {
    const existingVeiculo = new Veiculo('ABC1234', 'Civic', 2022, 'Honda');
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(existingVeiculo);
    jest.spyOn(VeiculoRepository.prototype, 'deletarVeiculo').mockResolvedValue();

    const response = await request(app).delete('/api/veiculos/existing-id').auth(_token, { type: 'bearer' });

    expect(response.status).toBe(204);
  });
});
