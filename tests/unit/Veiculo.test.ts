import { Veiculo } from '../../src/Entities/Veiculo';

describe('Veiculo', () => {
  test('deve criar instância de Veiculo com todos os atributos', () => {
    const veiculo = new Veiculo('ABC1234', 'Civic', 2022, 'Honda');

    expect(veiculo).toBeInstanceOf(Veiculo);
    expect(veiculo.placa).toBe('ABC1234');
    expect(veiculo.modelo).toBe('Civic');
    expect(veiculo.ano).toBe(2022);
    expect(veiculo.marca).toBe('Honda');
  });
});
