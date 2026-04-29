export class Cliente {
    Nome: string;
    Email: string;
    Cpf: string;
    Telefone: string;

    constructor(nome: string, email: string, cpf: string, telefone: string) {
        this.Nome = nome;
        this.Email = email;
        this.Cpf = cpf;
        this.Telefone = telefone;
    }
}