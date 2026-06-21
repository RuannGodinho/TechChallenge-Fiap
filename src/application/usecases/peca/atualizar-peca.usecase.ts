import { UpdatePecaInputDto } from '../../dtos/peca/peca.dtos';
import { Peca } from '../../../enterprise/entities/peca.entity';
import { IPecaGateway } from '../../ports/peca.gateway.port';

export class AtualizarPecaUseCase {
    constructor(private readonly gateway: IPecaGateway) {}

    async execute(id: string, input: UpdatePecaInputDto): Promise<Peca | null> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return null;
        }

        const nome = input.nome ?? existing.nome;
        const descricao = input.descricao ?? existing.descricao;
        const preco = input.preco ?? existing.preco;
        const tipo = input.tipo ?? existing.tipo;

        try {
            const updated = Peca.create(nome, descricao, preco, tipo);
            return this.gateway.update(
                id,
                new Peca(
                    updated.nome,
                    updated.descricao,
                    updated.preco,
                    updated.tipo,
                    existing.id,
                    existing.quantidade
                )
            );
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    }
}
