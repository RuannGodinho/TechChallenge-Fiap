import { Documento } from '../value-objects/documento.vo';
import { Email } from '../value-objects/email.vo';
import { StatusCliente } from '../value-objects/status-cliente.vo';

export class Cliente {
    id?: string;
    nome: string;
    email: Email;
    readonly documento: Documento;
    telefone: string;
    status: StatusCliente;

    constructor(
        nome: string,
        email: Email,
        documento: Documento,
        telefone: string,
        id?: string,
        status: StatusCliente = StatusCliente.ativo()
    ) {
        this.nome = nome;
        this.email = email;
        this.documento = documento;
        this.telefone = telefone;
        this.id = id;
        this.status = status;
    }

    static create(
        nome: string,
        email: string,
        cpfCnpj: string,
        telefone: string,
        status?: string
    ): Cliente {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome e obrigatorio');
        }

        return new Cliente(
            nome.trim(),
            Email.from(email),
            Documento.from(cpfCnpj),
            telefone,
            undefined,
            status ? StatusCliente.from(status) : StatusCliente.ativo()
        );
    }

    withStatus(status: StatusCliente): Cliente {
        return new Cliente(
            this.nome,
            this.email,
            this.documento,
            this.telefone,
            this.id,
            status
        );
    }
}
