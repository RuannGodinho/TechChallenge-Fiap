import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { IClienteGateway } from '../../ports/cliente.gateway.port';
import { logger } from '../../../infrastructure/logging/logger';

export interface IListarClientesUseCase {
    execute(): Promise<Cliente[]>;
}

export class ListarClientesUseCase implements IListarClientesUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(): Promise<Cliente[]> {
        logger.info({ msg: 'clientes_list_test' });
        return this.gateway.findAll();
    }
}
