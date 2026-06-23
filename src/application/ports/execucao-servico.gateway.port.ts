import { ExecucaoServico } from '../../enterprise/entities/execucao-servico.entity';

export interface IExecucaoServicoGateway {
    save(execucao: ExecucaoServico): Promise<ExecucaoServico>;
    saveMany(execucoes: ExecucaoServico[]): Promise<void>;
    findById(id: string): Promise<ExecucaoServico | null>;
    findByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]>;
    findFinalizadas(): Promise<ExecucaoServico[]>;
    update(id: string, execucao: Partial<ExecucaoServico>): Promise<ExecucaoServico | null>;
}
