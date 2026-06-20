import { Veiculo } from '../../../enterprise/entities/veiculo.entity';
import { IVeiculoGateway } from '../../ports/veiculo.gateway.port';

export class ListarVeiculosUseCase {
    constructor(private readonly gateway: IVeiculoGateway) {}

    async execute(): Promise<Veiculo[]> {
        return this.gateway.findAll();
    }
}
