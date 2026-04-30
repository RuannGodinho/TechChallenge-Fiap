export class Peca{
    Nome: string;
    Descricao: string;
    Tipo: 'Peca' | 'Insumo';
    Preco: number;

    constructor(Nome: string, Descricao: string, Preco: number, Tipo: 'Peca' | 'Insumo' ){
        this.Nome = Nome;
        this.Descricao = Descricao;
        this.Preco = Preco;
        this.Tipo = Tipo;
    }
}