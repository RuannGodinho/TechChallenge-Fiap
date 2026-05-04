import { Orcamento } from "../../Entities/orcamento";

export interface IOrcamentoService {
    createOrcamento(orcamento: Orcamento): Promise<Orcamento>;
    updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null>;
    getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]>;
}