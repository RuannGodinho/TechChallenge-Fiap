import { IVeiculoGateway } from '../../ports/veiculo.gateway.port';

export class DeletarVeiculoUseCase {
    constructor(private readonly gateway: IVeiculoGateway) {}

    async execute(id: string): Promise<boolean> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return false;
        }

        return this.gateway.delete(id);
    }
}
