import { Peca } from '../../../enterprise/entities/peca.entity';
import { IPecaGateway } from '../../ports/peca.gateway.port';

export class BuscarPecaPorIdUseCase {
    constructor(private readonly gateway: IPecaGateway) {}

    async execute(id: string): Promise<Peca | null> {
        return this.gateway.findById(id);
    }
}
