import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { Documento } from '../../../enterprise/value-objects/documento.vo';
import { Email } from '../../../enterprise/value-objects/email.vo';

export interface ClientePersistenceModel {
    _id?: { toString(): string };
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
}

export class ClienteMapper {
    static toPersistence(cliente: Cliente): Omit<ClientePersistenceModel, '_id'> {
        return {
            nome: cliente.nome,
            email: cliente.email.value,
            cpf: cliente.documento.value,
            telefone: cliente.telefone,
        };
    }

    static toDomain(raw: ClientePersistenceModel): Cliente {
        const id = raw._id?.toString();
        return new Cliente(
            raw.nome,
            Email.from(raw.email),
            Documento.from(raw.cpf),
            raw.telefone,
            id
        );
    }
}
