import { PecaId } from './peca-id.vo';

export class OrdemPecaItem {
    pecaId: PecaId;
    quantidade: number;
    valorUnitario: number;

    private constructor(pecaId: PecaId, quantidade: number, valorUnitario: number) {
        this.pecaId = pecaId;
        this.quantidade = quantidade;
        this.valorUnitario = valorUnitario;
    }

    static create(pecaId: string, quantidade: number, valorUnitario = 0): OrdemPecaItem {
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error(`Quantidade inválida para peça ${pecaId}`);
        }

        if (valorUnitario < 0) {
            throw new Error(`Valor unitário inválido para peça ${pecaId}`);
        }

        return new OrdemPecaItem(PecaId.from(pecaId), quantidade, valorUnitario);
    }

    static restore(pecaId: string, quantidade: number, valorUnitario: number): OrdemPecaItem {
        return new OrdemPecaItem(PecaId.from(pecaId), quantidade, valorUnitario);
    }
}
