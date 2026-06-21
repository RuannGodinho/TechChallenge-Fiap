import { CreatePecaInputDto } from '../../dtos/peca/peca.dtos';
import { Peca } from '../../../enterprise/entities/peca.entity';
import { IPecaGateway } from '../../ports/peca.gateway.port';

export class CriarPecaUseCase {
    constructor(private readonly gateway: IPecaGateway) {}

    async execute(input: CreatePecaInputDto): Promise<Peca> {
        try {
            const peca = Peca.create(input.nome, input.descricao, input.preco, input.tipo);
            return await this.gateway.save(peca);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    }
}
