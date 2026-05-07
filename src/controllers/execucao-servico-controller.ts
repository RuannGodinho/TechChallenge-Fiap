import { ExecucaoServico } from "../Entities/execucao-servico";
import { IExecucaoServicoService } from "../Interfaces/ExecucaoServico/execucao-servico-service.interface";

export class ExecucaoServicoController {
  constructor(private service: IExecucaoServicoService) {}

  async iniciarExecucao(id: string) {
    return await this.service.iniciarExecucao(id);
  }

  async finalizarExecucao(id: string) {
    return await this.service.finalizarExecucao(id);
  }

  async getTempoMedioServicos() {
    return await this.service.getTempoMedioServicos();
  }

  async getExecucoesByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]> {
      return await this.service.getExecucoesByOrdemServicoId(ordemServicoId);
  }  
}
