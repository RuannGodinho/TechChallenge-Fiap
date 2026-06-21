import { Estoque } from '../../../enterprise/entities/estoque.entity';
import { IEstoqueGateway } from '../../ports/estoque.gateway.port';

export class BuscarEstoquePorPecaIdUseCase {
    constructor(private readonly gateway: IEstoqueGateway) {}

    async execute(pecaId: string): Promise<Estoque | null> {
        return this.gateway.findByPecaId(pecaId);
    }
}
