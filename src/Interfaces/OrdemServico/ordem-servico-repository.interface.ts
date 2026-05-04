import { OrdemServico } from "../../Entities/ordem-servico";

export interface IOrdemServicoRepository {
  createOrdemServico(ordemServico: any): Promise<void>;
  listaOrdensServico(): Promise<any[]>;
  getOSById(id: string): Promise<OrdemServico | null>
  updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null>;
}