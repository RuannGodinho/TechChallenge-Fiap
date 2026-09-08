import { Documento } from '../../../enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface ClienteAuthLookupDto {
    id: string;
    cpf: string;
    email: string;
    nome: string;
    status: string;
}

export class ConsultarClienteAuthUseCase {
    constructor(private readonly clienteGateway: IClienteGateway) {}

    async execute(cpf: string): Promise<ClienteAuthLookupDto | null> {
        const documento = Documento.from(cpf);
        const cliente = await this.clienteGateway.findByDocumento(documento);

        if (!cliente) {
            return null;
        }

        return {
            id: cliente.id ?? cliente.documento.value,
            cpf: cliente.documento.value,
            email: cliente.email.value,
            nome: cliente.nome,
            status: cliente.status.value,
        };
    }
}
