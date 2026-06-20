import { UpdateClienteInputDto } from '../../dtos/cliente/cliente.dtos';
import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { Documento } from '../../../enterprise/value-objects/documento.vo';
import { Email } from '../../../enterprise/value-objects/email.vo';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface IAtualizarClienteUseCase {
    execute(id: string, input: UpdateClienteInputDto): Promise<Cliente | null>;
}

export class AtualizarClienteUseCase implements IAtualizarClienteUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(id: string, input: UpdateClienteInputDto): Promise<Cliente | null> {
        const existing = await this.gateway.findById(id);
        if (!existing) {
            return null;
        }

        const nome = input.nome ?? existing.nome;
        const email = input.email ? Email.from(input.email) : existing.email;
        const documento = input.cpf ? Documento.from(input.cpf) : existing.documento;
        const telefone = input.telefone ?? existing.telefone;

        const updated = new Cliente(nome, email, documento, telefone, existing.id);
        return this.gateway.update(id, updated);
    }
}
