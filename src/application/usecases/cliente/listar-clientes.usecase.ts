import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { IClienteGateway } from '../../ports/cliente.gateway.port';
import { IObservabilityPort } from '../../ports/observability.port';

export interface IListarClientesUseCase {
    execute(): Promise<Cliente[]>;
}

export class ListarClientesUseCase implements IListarClientesUseCase {
    constructor(private readonly gateway: IClienteGateway, private readonly observability?: IObservabilityPort) {}

    async execute(): Promise<Cliente[]> {
        this.observability?.emit({ msg: 'clientes_listados' });
        return this.gateway.findAll();
    }
}
