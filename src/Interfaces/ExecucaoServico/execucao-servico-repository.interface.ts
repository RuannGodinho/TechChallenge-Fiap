import { ExecucaoServico } from "../../Entities/execucao-servico";

export interface IExecucaoServicoRepository {
  createExecucaoServico(execucaoServico: ExecucaoServico): Promise<void>;
  createExecucoesServico(execucoes: ExecucaoServico[]): Promise<void>;
  getExecucaoById(id: string): Promise<ExecucaoServico | null>;
  updateExecucao(id: string, updates: Partial<ExecucaoServico>): Promise<ExecucaoServico | null>;
  getExecucoesFinalizadas(): Promise<ExecucaoServico[]>;
  getExecucoesByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]>;
}
