export class Servico {
    Nome: string;
    Descricao: string;
    Preco: number;

    constructor(nome: string, descricao: string, preco: number) {
        this.Nome = nome;
        this.Descricao = descricao;
        this.Preco = preco;
    }
}