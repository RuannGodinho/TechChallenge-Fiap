import { UpdateServicoInputDto } from '../../dtos/servico/servico.dtos';
import { Servico } from '../../../enterprise/entities/servico.entity';
import { IServicoGateway } from '../../ports/servico.gateway.port';

export class AtualizarServicoUseCase {
    constructor(private readonly gateway: IServicoGateway) {}

    async execute(id: string, input: UpdateServicoInputDto): Promise<Servico | null> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return null;
        }

        const nome = input.nome ?? existing.nome;
        const descricao = input.descricao ?? existing.descricao;
        const preco = input.preco ?? existing.preco;

        try {
            const updated = Servico.create(nome, descricao, preco);
            return this.gateway.update(
                id,
                new Servico(
                    updated.nome,
                    updated.descricao,
                    updated.preco,
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
