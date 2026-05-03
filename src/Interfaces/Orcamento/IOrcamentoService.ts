import { Orcamento } from "../../Entities/Orcamento";

export interface IOrcamentoService {
    createOrcamento(orcamento: Orcamento): Promise<Orcamento>;
    updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null>;
}