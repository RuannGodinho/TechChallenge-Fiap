import { ExecucaoServico } from "../../Entities/execucao-servico";

export interface IExecucaoServicoService {
  createExecucaoServico(ordemServicoId: string, servicoId: string): Promise<ExecucaoServico>;
  iniciarExecucao(id: string): Promise<ExecucaoServico>;
  finalizarExecucao(id: string): Promise<ExecucaoServico>;
  getTempoMedioServicos(): Promise<{
    tempoMedioMinutos: number;
    totalServicosFinalizados: number;
    maisRapidoMinutos: number;
    maisLentoMinutos: number;
  }>;
  createExecucoesParaServicos(ordemServicoId: string, servicoIds: string[]): Promise<void>;
  getExecucoesByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]>
}
