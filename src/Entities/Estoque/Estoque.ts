import { ObjectId } from "mongodb";

export class Estoque {
    PecaId: ObjectId;
    Quantidade: number;

    constructor(PecaId: ObjectId, Quantidade: number) {
        this.PecaId = PecaId;
        this.Quantidade = Quantidade;
    }
}