import { UpdateVeiculoInputDto } from '../../dtos/veiculo/veiculo.dtos';
import { Veiculo } from '../../../enterprise/entities/veiculo.entity';
import { Placa } from '../../../enterprise/value-objects/placa.vo';
import { IVeiculoGateway } from '../../ports/veiculo.gateway.port';

export class AtualizarVeiculoUseCase {
    constructor(private readonly gateway: IVeiculoGateway) {}

    async execute(id: string, input: UpdateVeiculoInputDto): Promise<Veiculo | null> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return null;
        }

        const placa = input.placa ? Placa.from(input.placa) : existing.placa;
        const modelo = input.modelo ?? existing.modelo;
        const ano = input.ano ?? existing.ano;
        const marca = input.marca ?? existing.marca;

        if (input.ano !== undefined && (!Number.isInteger(input.ano) || input.ano <= 0)) {
            throw new Error('Ano inválido');
        }

        const updated = new Veiculo(placa, modelo, ano, marca, existing.id);
        return this.gateway.update(id, updated);
    }
}
