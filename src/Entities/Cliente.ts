export class Cliente {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;

    constructor(nome: string, email: string, cpf: string, telefone: string) {
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.telefone = telefone;
    }
}