import { Veiculo } from '../../src/Entities/Veiculo';

describe('Veiculo', () => {
  test('deve criar instância de Veiculo com todos os atributos', () => {
    const veiculo = new Veiculo('ABC1234', 'Civic', 2022, 'Honda');

    expect(veiculo).toBeInstanceOf(Veiculo);
    expect(veiculo.Placa).toBe('ABC1234');
    expect(veiculo.Modelo).toBe('Civic');
    expect(veiculo.Ano).toBe(2022);
    expect(veiculo.Marca).toBe('Honda');
  });
});
