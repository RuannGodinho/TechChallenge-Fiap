import { OrdemServico } from "../../Entities/ordem-servico";

export interface IOrdemServicoService {
    createOrdemServico(OrdemServico: any): Promise<OrdemServico>;
    listaOrdensServico(): Promise<OrdemServico[]>;
    updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null>;
}