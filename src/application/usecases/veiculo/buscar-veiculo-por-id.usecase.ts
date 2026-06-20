import { Veiculo } from '../../../enterprise/entities/veiculo.entity';
import { IVeiculoGateway } from '../../ports/veiculo.gateway.port';

export class BuscarVeiculoPorIdUseCase {
    constructor(private readonly gateway: IVeiculoGateway) {}

    async execute(id: string): Promise<Veiculo | null> {
        return this.gateway.findById(id);
    }
}
