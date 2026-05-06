import { IExecucaoServicoService } from "../Interfaces/ExecucaoServico/execucao-servico-service.interface";

export class ExecucaoServicoController {
  constructor(private service: IExecucaoServicoService) {}

  async createExecucaoServico(data: { ordemServicoId: string; servicoId: string }) {
    return await this.service.createExecucaoServico(data.ordemServicoId, data.servicoId);
  }

  async iniciarExecucao(id: string) {
    return await this.service.iniciarExecucao(id);
  }

  async finalizarExecucao(id: string) {
    return await this.service.finalizarExecucao(id);
  }

  async getTempoMedioServicos() {
    return await this.service.getTempoMedioServicos();
  }
}
