import { ObjectId } from "mongodb";

export class OrdemPecaItem {
    PecaId: ObjectId;
    Quantidade: number;
    ValorUnitario: number;

    constructor(PecaId: ObjectId, Quantidade: number, ValorUnitario: number) {
        this.PecaId = PecaId;
        this.Quantidade = Quantidade;
        this.ValorUnitario = ValorUnitario;
    }
}