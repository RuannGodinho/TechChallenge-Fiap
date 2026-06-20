import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface IListarClientesUseCase {
    execute(): Promise<Cliente[]>;
}

export class ListarClientesUseCase implements IListarClientesUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(): Promise<Cliente[]> {
        return this.gateway.findAll();
    }
}
