import { CreateVeiculoInputDto } from '../../dtos/veiculo/veiculo.dtos';
import { Veiculo } from '../../../enterprise/entities/veiculo.entity';
import { IVeiculoGateway } from '../../ports/veiculo.gateway.port';

export class CriarVeiculoUseCase {
    constructor(private readonly gateway: IVeiculoGateway) {}

    async execute(input: CreateVeiculoInputDto): Promise<Veiculo> {
        try {
            const veiculo = Veiculo.create(input.placa, input.modelo, input.ano, input.marca);
            return await this.gateway.save(veiculo);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Erro ao criar veículo:${message}`);
        }
    }
}
