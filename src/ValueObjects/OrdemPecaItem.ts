import { ObjectId } from "mongodb";

export class OrdemPecaItem {
    pecaId: ObjectId;
    quantidade: number;
    valorUnitario: number;

    constructor(pecaId: ObjectId, quantidade: number, valorUnitario: number) {
        this.pecaId = pecaId;
        this.quantidade = quantidade;
        this.valorUnitario = valorUnitario;
    }
}