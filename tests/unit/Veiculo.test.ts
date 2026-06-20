import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { Placa } from '../../src/enterprise/value-objects/placa.vo';

describe('Veiculo', () => {
    test('deve criar instância de Veiculo com todos os atributos', () => {
        const veiculo = Veiculo.create('ABC1234', 'Civic', 2022, 'Honda');

        expect(veiculo).toBeInstanceOf(Veiculo);
        expect(veiculo.placa).toBeInstanceOf(Placa);
        expect(veiculo.placa.value).toBe('ABC1234');
        expect(veiculo.modelo).toBe('Civic');
        expect(veiculo.ano).toBe(2022);
        expect(veiculo.marca).toBe('Honda');
    });
});
