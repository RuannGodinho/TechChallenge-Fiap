import { Orcamento } from "../Entities/orcamento";
import { IOrcamentoService } from "../Interfaces/Orcamento/orcamento-service.interface";

export class OrcamentoController {
    constructor(private service: IOrcamentoService) {};

    async updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null> {
        return await this.service.updateOrcamento(id, updates);
    }

    async getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
        return await this.service.getOrcamentosByOrdemServicoId(ordemServicoId);
    }
}