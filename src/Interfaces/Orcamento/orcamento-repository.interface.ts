import { Orcamento } from "../../Entities/orcamento";

export interface IOrcamentoRepository {
  createOrcamento(orcamento: Orcamento): Promise<void>;
  getOrcamentoById(id: string): Promise<Orcamento | null>;
  updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null>;
}