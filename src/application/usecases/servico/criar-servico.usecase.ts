import { CreateServicoInputDto } from '../../dtos/servico/servico.dtos';
import { Servico } from '../../../enterprise/entities/servico.entity';
import { IServicoGateway } from '../../ports/servico.gateway.port';

export class CriarServicoUseCase {
    constructor(private readonly gateway: IServicoGateway) {}

    async execute(input: CreateServicoInputDto): Promise<Servico> {
        try {
            const servico = Servico.create(input.nome, input.descricao, input.preco);
            return await this.gateway.save(servico);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    }
}
