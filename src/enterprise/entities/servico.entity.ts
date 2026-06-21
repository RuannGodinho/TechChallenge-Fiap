export class Servico {
    id?: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade?: number;

    constructor(nome: string, descricao: string, preco: number, id?: string, quantidade?: number) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.id = id;
        this.quantidade = quantidade;
    }

    static create(nome: string, descricao: string, preco: number): Servico {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        if (!descricao || descricao.trim() === '') {
            throw new Error('Descrição é obrigatória');
        }

        if (preco == null || preco < 0) {
            throw new Error('Preço inválido');
        }

        return new Servico(nome.trim(), descricao.trim(), preco);
    }
}
