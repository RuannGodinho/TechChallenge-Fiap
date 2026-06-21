import { TipoItem } from '../../validators/tipo-item';

export class Peca {
    id?: string;
    nome: string;
    descricao: string;
    tipo: TipoItem;
    preco: number;
    quantidade?: number;

    constructor(
        nome: string,
        descricao: string,
        preco: number,
        tipo: TipoItem,
        id?: string,
        quantidade?: number
    ) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.tipo = tipo;
        this.id = id;
        this.quantidade = quantidade;
    }

    static create(
        nome: string,
        descricao: string,
        preco: number,
        tipo: string
    ): Peca {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        if (!descricao || descricao.trim() === '') {
            throw new Error('Descrição é obrigatória');
        }

        if (preco == null || preco < 0) {
            throw new Error('Preço inválido');
        }

        const normalizedTipo = tipo.toUpperCase();
        const tiposValidos: string[] = [TipoItem.PECA, TipoItem.INSUMO];

        if (!tiposValidos.includes(normalizedTipo)) {
            throw new Error('Tipo inválido. Use PECA ou INSUMO');
        }

        return new Peca(
            nome.trim(),
            descricao.trim(),
            preco,
            normalizedTipo as TipoItem
        );
    }
}
