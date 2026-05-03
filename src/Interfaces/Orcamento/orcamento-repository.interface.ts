import { Orcamento } from "../../Entities/Orcamento";
import { ObjectId } from "mongodb";

export interface IOrcamentoRepository {
  createOrcamento(orcamento: Orcamento): Promise<void>;
  getOrcamentoById(id: string): Promise<Orcamento | null>;
  updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null>;
}