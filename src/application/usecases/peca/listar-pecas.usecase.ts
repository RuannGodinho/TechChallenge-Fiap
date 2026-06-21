import { Peca } from '../../../enterprise/entities/peca.entity';
import { IPecaGateway } from '../../ports/peca.gateway.port';

export class ListarPecasUseCase {
    constructor(private readonly gateway: IPecaGateway) {}

    async execute(): Promise<Peca[]> {
        return this.gateway.findAll();
    }
}
