export interface IExecucaoServicoPort {
    createExecucoesParaServicos(ordemServicoId: string, servicoIds: string[]): Promise<void>;
}
