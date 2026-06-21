import { Estoque } from '../../../enterprise/entities/estoque.entity';
import { IEstoqueGateway } from '../../ports/estoque.gateway.port';

export class ListarEstoqueUseCase {
    constructor(private readonly gateway: IEstoqueGateway) {}

    async execute(): Promise<Estoque[]> {
        return this.gateway.findAll();
    }
}
