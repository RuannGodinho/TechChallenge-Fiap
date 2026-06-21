import { IServicoGateway } from '../../ports/servico.gateway.port';

export class DeletarServicoUseCase {
    constructor(private readonly gateway: IServicoGateway) {}

    async execute(id: string): Promise<boolean> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return false;
        }

        return this.gateway.delete(id);
    }
}
