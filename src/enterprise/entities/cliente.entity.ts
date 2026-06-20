import { Documento } from '../value-objects/documento.vo';
import { Email } from '../value-objects/email.vo';

export class Cliente {
    id?: string;
    nome: string;
    email: Email;
    readonly documento: Documento;
    telefone: string;

    constructor(
        nome: string,
        email: Email,
        documento: Documento,
        telefone: string,
        id?: string
    ) {
        this.nome = nome;
        this.email = email;
        this.documento = documento;
        this.telefone = telefone;
        this.id = id;
    }

    static create(
        nome: string,
        email: string,
        cpfCnpj: string,
        telefone: string
    ): Cliente {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome e obrigatorio');
        }

        return new Cliente(
            nome.trim(),
            Email.from(email),
            Documento.from(cpfCnpj),
            telefone
        );
    }
}
