import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { Documento } from '../../../enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface IBuscarClientePorCpfUseCase {
    execute(cpfCnpj: string): Promise<Cliente | null>;
}

export class BuscarClientePorCpfUseCase implements IBuscarClientePorCpfUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(cpfCnpj: string): Promise<Cliente | null> {
        const documento = Documento.from(cpfCnpj);
        return this.gateway.findByDocumento(documento);
    }
}
