import { OrdemServico } from "../Entities/OrdemServico";
import { IOrdemServicoService } from "../Interfaces/OrdemServico/IOrdemServicoService";

export class OrdemServicoController {
    constructor(private service: IOrdemServicoService) {};

    async createOrdemServico(ordemServicoData: Omit<OrdemServico, 'id'>): Promise<OrdemServico> {
        return await this.service.createOrdemServico(ordemServicoData);
    }

    async listaOrdensServico(): Promise<OrdemServico[]> {
        return await this.service.listaOrdensServico();
    }

    async updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null> {
        return await this.service.updateOrdemServico(id, updates);
    }
}