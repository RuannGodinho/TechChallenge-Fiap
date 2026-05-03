import { Orcamento } from "../Entities/Orcamento";
import { IOrcamentoService } from "../Interfaces/Orcamento/IOrcamentoService";

export class OrcamentoController {
    constructor(private service: IOrcamentoService) {};

    async updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null> {
        return await this.service.updateOrcamento(id, updates);
    }
}