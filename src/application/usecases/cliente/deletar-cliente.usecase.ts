import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface IDeletarClienteUseCase {
    execute(id: string): Promise<boolean>;
}

export class DeletarClienteUseCase implements IDeletarClienteUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(id: string): Promise<boolean> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return false;
        }

        return this.gateway.delete(id);
    }
}
