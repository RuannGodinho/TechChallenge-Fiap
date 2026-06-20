import { CriarVeiculoUseCase } from '../../src/application/usecases/veiculo/criar-veiculo.usecase';
import { BuscarVeiculoPorIdUseCase } from '../../src/application/usecases/veiculo/buscar-veiculo-por-id.usecase';
import { DeletarVeiculoUseCase } from '../../src/application/usecases/veiculo/deletar-veiculo.usecase';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { Placa } from '../../src/enterprise/value-objects/placa.vo';
import { IVeiculoGateway } from '../../src/application/ports/veiculo.gateway.port';

describe('Veiculo use cases', () => {
    let gateway: jest.Mocked<IVeiculoGateway>;
    let criarVeiculoUseCase: CriarVeiculoUseCase;
    let buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase;
    let deletarVeiculoUseCase: DeletarVeiculoUseCase;

    beforeEach(() => {
        gateway = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            findByPlaca: jest.fn().mockResolvedValue(null),
            save: jest.fn(async (veiculo: Veiculo) => veiculo),
            update: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(false),
        };

        criarVeiculoUseCase = new CriarVeiculoUseCase(gateway);
        buscarVeiculoPorIdUseCase = new BuscarVeiculoPorIdUseCase(gateway);
        deletarVeiculoUseCase = new DeletarVeiculoUseCase(gateway);
    });

    test('deve criar veículo com placa válida', async () => {
        gateway.save.mockImplementation(async (veiculo) =>
            new Veiculo(veiculo.placa, veiculo.modelo, veiculo.ano, veiculo.marca, 'generated-id')
        );

        const veiculo = await criarVeiculoUseCase.execute({
            placa: 'ABC1234',
            modelo: 'Civic',
            ano: 2022,
            marca: 'Honda',
        });

        expect(gateway.save).toHaveBeenCalled();
        expect(veiculo.placa.value).toBe('ABC1234');
    });

    test('deve rejeitar placa inválida', async () => {
        await expect(
            criarVeiculoUseCase.execute({
                placa: 'INVALID',
                modelo: 'Civic',
                ano: 2022,
                marca: 'Honda',
            })
        ).rejects.toThrow('Erro ao criar veículo:Placa inválida');

        expect(gateway.save).not.toHaveBeenCalled();
    });

    test('deve buscar veículo por id', async () => {
        const existing = new Veiculo(
            Placa.from('ABC1234'),
            'Civic',
            2022,
            'Honda',
            'any-id'
        );
        gateway.findById.mockResolvedValue(existing);

        const veiculo = await buscarVeiculoPorIdUseCase.execute('any-id');

        expect(veiculo?.placa.value).toBe('ABC1234');
    });

    test('deve deletar veículo existente', async () => {
        const existing = new Veiculo(
            Placa.from('ABC1234'),
            'Civic',
            2022,
            'Honda',
            'existing-id'
        );
        gateway.findById.mockResolvedValue(existing);
        gateway.delete.mockResolvedValue(true);

        const deleted = await deletarVeiculoUseCase.execute('existing-id');

        expect(deleted).toBe(true);
        expect(gateway.delete).toHaveBeenCalledWith('existing-id');
    });
});
