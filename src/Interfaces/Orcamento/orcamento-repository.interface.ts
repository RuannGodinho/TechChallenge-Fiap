import { Orcamento } from "../../Entities/orcamento";

export interface IOrcamentoRepository {
  createOrcamento(orcamento: Orcamento): Promise<void>;
  getOrcamentoById(id: string): Promise<Orcamento | null>;
  getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]>;
  updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null>;
}