import { Servico } from '../../../enterprise/entities/servico.entity';
import { IServicoGateway } from '../../ports/servico.gateway.port';

export class BuscarServicoPorIdUseCase {
    constructor(private readonly gateway: IServicoGateway) {}

    async execute(id: string): Promise<Servico | null> {
        return this.gateway.findById(id);
    }
}
