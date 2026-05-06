import { ObjectId } from "mongodb";
import { ExecucaoServico } from "../Entities/execucao-servico";
import { IExecucaoServicoRepository } from "../Interfaces/ExecucaoServico/execucao-servico-repository.interface";
import { IExecucaoServicoService } from "../Interfaces/ExecucaoServico/execucao-servico-service.interface";
import { IOrdemServicoRepository } from "../Interfaces/OrdemServico/ordem-servico-repository.interface";
import { IServicoService } from "../Interfaces/Servico/servico-service.interface";

export class ExecucaoServicoService implements IExecucaoServicoService {
  constructor(
    private repo: IExecucaoServicoRepository,
    private ordemServicoRepo: IOrdemServicoRepository,
    private servicoService: IServicoService
  ) {}

  async createExecucaoServico(ordemServicoId: string, servicoId: string): Promise<ExecucaoServico> {
    await this.validateOrdemServico(ordemServicoId);
    await this.validateServico(servicoId);

    const execucao = new ExecucaoServico(
      new ObjectId(ordemServicoId),
      new ObjectId(servicoId),
      "PENDENTE",
      null,
      null,
      new Date()
    );

    await this.repo.createExecucaoServico(execucao);
    return execucao;
  }

  async iniciarExecucao(id: string): Promise<ExecucaoServico> {
    const execucao = await this.getExecucaoOrThrow(id);

    if (execucao.status !== "PENDENTE") {
      if (execucao.status === "EM EXECUCAO") {
        throw new Error("Execução já iniciada.");
      }
      throw new Error("Não é possível iniciar uma execução já finalizada.");
    }

    // Validar se a OS está em execução
    await this.ValidaStatusOS(execucao);

    const atualizado = await this.repo.updateExecucao(id, {
      status: "EM EXECUCAO",
      iniciadoEm: new Date(),
    });

    if (!atualizado) {
      throw new Error("Falha ao iniciar a execução.");
    }

    return atualizado;
  }

    private async ValidaStatusOS(execucao: ExecucaoServico) {
        const ordemServico = await this.ordemServicoRepo.getOSById(execucao.ordemServicoId.toString());
        if (!ordemServico) {
            throw new Error(`Ordem de serviço não encontrada para o id ${execucao.ordemServicoId}.`);
        }

        if (ordemServico.status !== "EM EXECUCAO") {
            throw new Error("Não é possível iniciar a execução de um serviço se a Ordem de Serviço não estiver em execução.");
        }
    }

  async finalizarExecucao(id: string): Promise<ExecucaoServico> {
    const execucao = await this.getExecucaoOrThrow(id);

    if (execucao.status !== "EM EXECUCAO") {
      if (execucao.status === "PENDENTE") {
        throw new Error("Execução ainda não iniciada.");
      }
      throw new Error("Execução já finalizada.");
    }

    const atualizado = await this.repo.updateExecucao(id, {
      status: "FINALIZADO",
      finalizadoEm: new Date(),
    });

    if (!atualizado) {
      throw new Error("Falha ao finalizar a execução.");
    }

    // Verificar se todos os serviços da OS foram finalizados
    await this.verificarEFinalizarOrdemServico(execucao.ordemServicoId.toString());

    return atualizado;
  }

  async getTempoMedioServicos(): Promise<{
    tempoMedioMinutos: number;
    totalServicosFinalizados: number;
    maisRapidoMinutos: number;
    maisLentoMinutos: number;
  }> {
    const execucoes = await this.repo.getExecucoesFinalizadas();

    if (!execucoes.length) {
      return {
        tempoMedioMinutos: 0,
        totalServicosFinalizados: 0,
        maisRapidoMinutos: 0,
        maisLentoMinutos: 0,
      };
    }

    const duracoes = execucoes.map((execucao) => {
      const inicio = execucao.iniciadoEm?.getTime() ?? 0;
      const fim = execucao.finalizadoEm?.getTime() ?? 0;
      return (fim - inicio) / 60000;
    });

    const totalServicosFinalizados = duracoes.length;
    const tempoMedioMinutos = Math.round(duracoes.reduce((sum, current) => sum + current, 0) / totalServicosFinalizados);
    const maisRapidoMinutos = Math.round(Math.min(...duracoes));
    const maisLentoMinutos = Math.round(Math.max(...duracoes));

    return {
      tempoMedioMinutos,
      totalServicosFinalizados,
      maisRapidoMinutos,
      maisLentoMinutos,
    };
  }

  async createExecucoesParaServicos(ordemServicoId: string, servicoIds: string[]): Promise<void> {
    await this.validateOrdemServico(ordemServicoId);

    const execucoes: ExecucaoServico[] = [];

    for (const servicoId of servicoIds) {
      await this.validateServico(servicoId);
      execucoes.push(
        new ExecucaoServico(
          new ObjectId(ordemServicoId),
          new ObjectId(servicoId),
          "PENDENTE",
          null,
          null,
          new Date()
        )
      );
    }

    await this.repo.createExecucoesServico(execucoes);
  }

  private async getExecucaoOrThrow(id: string): Promise<ExecucaoServico> {
    const execucao = await this.repo.getExecucaoById(id);

    if (!execucao) {
      throw new Error(`Execução não encontrada para o id ${id}.`);
    }

    return execucao;
  }

  private async validateOrdemServico(id: string): Promise<void> {
    const ordem = await this.ordemServicoRepo.getOSById(id);

    if (!ordem) {
      throw new Error(`Ordem de serviço não encontrada para o id ${id}.`);
    }
  }

  private async validateServico(id: string): Promise<void> {
    const servico = await this.servicoService.getServicoById(id);

    if (!servico) {
      throw new Error(`Serviço não encontrado para o id ${id}.`);
    }
  }

  private async verificarEFinalizarOrdemServico(ordemServicoId: string): Promise<void> {
    const execucoes = await this.repo.getExecucoesByOrdemServicoId(ordemServicoId);

    // Verificar se todas as execuções estão finalizadas
    const todasFinalizadas = execucoes.every(execucao => execucao.status === "FINALIZADO");

    if (todasFinalizadas && execucoes.length > 0) {
      // Atualizar o status da OS para FINALIZADA
      await this.ordemServicoRepo.updateOrdemServico(ordemServicoId, { status: "FINALIZADA" });
    }
  }
}
