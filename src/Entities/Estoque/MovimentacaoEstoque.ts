import { ObjectId } from "mongodb";

export class MovimentacaoEstoque {
  PecaId: ObjectId;
  Tipo: 'ENTRADA' | 'SAIDA';
  Quantidade: number;
  Data: Date;
  Origem?: string; // OS, compra, ajuste

  constructor(PecaId: ObjectId, Tipo: 'ENTRADA' | 'SAIDA', Quantidade: number, Data: Date, Origem?: string) {
    this.PecaId = PecaId;
    this.Tipo = Tipo;
    this.Quantidade = Quantidade;
    this.Data = Data;
    this.Origem = Origem;
  }
}