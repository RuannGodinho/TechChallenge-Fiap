import { ObjectId } from "mongodb";

export class Estoque {
    pecaId: ObjectId;
    quantidade: number;

    constructor(pecaId: ObjectId, quantidade: number) {
        this.pecaId = pecaId;
        this.quantidade = quantidade;
    }
}