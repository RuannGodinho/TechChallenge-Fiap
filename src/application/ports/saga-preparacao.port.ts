import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
export interface ISagaPreparacaoPort {
    gerenciada(id: string): Promise<boolean>;
    criar(ordem: OrdemServico, key?: string): Promise<OrdemServico>;
    validarEdicao(id: string, key?: string): Promise<void>;
    repetirDiagnostico(id: string, key: string, input: unknown): Promise<OrdemServico | null>;
    salvarDiagnostico(ordem: OrdemServico, snapshot: any, key?: string, input?: unknown): Promise<OrdemServico>;
}
export interface IResultadoSagaPort {
    processar(message: unknown): Promise<void>;
    verificarPrazos(): Promise<void>;
}
