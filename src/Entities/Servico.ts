export class Servico {
    nome: string;
    descricao: string;
    preco: number;
    quantidade?: number

    constructor(nome: string, descricao: string, preco: number) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
    }
}