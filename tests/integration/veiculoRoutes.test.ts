import request from 'supertest';
import app from '../../app';
import { VeiculoRepository } from '../../src/Repository/VeiculoRepository';
import { Veiculo } from '../../src/Entities/Veiculo';

describe('Integração - Rotas de Veículos', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve retornar 400 quando dados obrigatórios estiverem ausentes', async () => {
    const response = await request(app)
      .post('/api/veiculos')
      .send({ Modelo: 'Civic', Ano: 2022, Marca: 'Honda' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Placa, Modelo, Ano, and Marca are required' });
  });

  test('deve criar veículo com sucesso', async () => {
    jest.spyOn(VeiculoRepository.prototype, 'criarVeiculo').mockResolvedValue();

    const response = await request(app)
      .post('/api/veiculos')
      .send({ Placa: 'ABC1234', Modelo: 'Civic', Ano: 2022, Marca: 'Honda' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ Placa: 'ABC1234', Modelo: 'Civic', Ano: 2022, Marca: 'Honda' });
  });

  test('deve retornar 404 ao buscar veículo inexistente', async () => {
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(null);

    const response = await request(app).get('/api/veiculos/id-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Veiculo not found' });
  });

  test('deve retornar 404 ao atualizar veículo inexistente', async () => {
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/veiculos/id-inexistente')
      .send({ Placa: 'ABC1234', Modelo: 'Civic', Ano: 2022, Marca: 'Honda' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Veiculo not found' });
  });

  test('deve retornar 204 ao deletar veículo existente', async () => {
    const existingVeiculo = new Veiculo('ABC1234', 'Civic', 2022, 'Honda');
    jest.spyOn(VeiculoRepository.prototype, 'getVeiculoById').mockResolvedValue(existingVeiculo);
    jest.spyOn(VeiculoRepository.prototype, 'deletarVeiculo').mockResolvedValue();

    const response = await request(app).delete('/api/veiculos/existing-id');

    expect(response.status).toBe(204);
  });
});
