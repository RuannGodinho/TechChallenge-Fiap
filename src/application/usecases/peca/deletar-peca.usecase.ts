import { IPecaGateway } from '../../ports/peca.gateway.port';

export class DeletarPecaUseCase {
    constructor(private readonly gateway: IPecaGateway) {}

    async execute(id: string): Promise<boolean> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return false;
        }

        return this.gateway.delete(id);
    }
}
