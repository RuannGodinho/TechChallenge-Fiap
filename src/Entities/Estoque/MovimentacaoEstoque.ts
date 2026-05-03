import { ObjectId } from "mongodb";

export class MovimentacaoEstoque {
  pecaId: ObjectId;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  data: Date;
  origem?: string; // OS, compra, ajuste

  constructor(pecaId: ObjectId, tipo: 'ENTRADA' | 'SAIDA', quantidade: number, data: Date, origem?: string) {
    this.pecaId = pecaId;
    this.tipo = tipo;
    this.quantidade = quantidade;
    this.data = data;
    this.origem = origem;
  }
}