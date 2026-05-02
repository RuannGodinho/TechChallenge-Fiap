import { OrdemServico } from "../../Entities/OrdemServico";

export interface IOrdemServicoRepository {
  createOrdemServico(ordemServico: any): Promise<void>;
  listaOrdensServico(): Promise<any[]>;
  updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null>;
}