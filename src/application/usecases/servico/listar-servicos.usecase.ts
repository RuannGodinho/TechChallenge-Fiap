import { Servico } from '../../../enterprise/entities/servico.entity';
import { IServicoGateway } from '../../ports/servico.gateway.port';

export class ListarServicosUseCase {
    constructor(private readonly gateway: IServicoGateway) {}

    async execute(): Promise<Servico[]> {
        return this.gateway.findAll();
    }
}
