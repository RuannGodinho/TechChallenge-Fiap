import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface IBuscarClientePorIdUseCase {
    execute(id: string): Promise<Cliente | null>;
}

export class BuscarClientePorIdUseCase implements IBuscarClientePorIdUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(id: string): Promise<Cliente | null> {
        return this.gateway.findById(id);
    }
}
