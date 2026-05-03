export class Peca{
    nome: string;
    descricao: string;
    tipo: 'Peca' | 'Insumo';
    preco: number;
    quantidade?: number;

    constructor(nome: string, descricao: string, preco: number, tipo: 'Peca' | 'Insumo' ){
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.tipo = tipo;
    }
}