export const BusinessEvent = {
    osCreated: 'os_created',
    osCreateRejected: 'os_create_rejected',
    osStatusChanged: 'os_status_changed',
    osProcessingFailed: 'os_processing_failed',
    osAutoFinalized: 'os_auto_finalized',
    orcamentoCreated: 'orcamento_created',
    orcamentoStatusChanged: 'orcamento_status_changed',
    execucaoStarted: 'execucao_started',
    execucaoFinished: 'execucao_finished',
    estoqueMovimentado: 'estoque_movimentado',
    smtpSent: 'smtp_sent',
    smtpSendFailed: 'smtp_send_failed',
    integrationFailed: 'integration_failed',
} as const;

export type BusinessEventName = (typeof BusinessEvent)[keyof typeof BusinessEvent];

export const BusinessReason = {
    clienteNaoEncontrado: 'cliente_nao_encontrado',
    veiculoNaoEncontrado: 'veiculo_nao_encontrado',
    illegalTransition: 'illegal_transition',
    orcamentoNaoAprovado: 'orcamento_nao_aprovado',
    estoqueInsuficiente: 'estoque_insuficiente',
    execucaoOsNotInExecution: 'execucao_os_not_in_execution',
} as const;

export type BusinessReasonCode = (typeof BusinessReason)[keyof typeof BusinessReason];

export type BusinessLogLevel = 'info' | 'warn' | 'error';

export interface BusinessLogEvent {
    msg: BusinessEventName | string;
    event?: 'business';
    alert?: boolean;
    reason?: BusinessReasonCode | string;
    level?: BusinessLogLevel;
    ordemServicoId?: string;
    orcamentoId?: string;
    execucaoId?: string;
    pecaId?: string;
    from?: string;
    to?: string;
    status?: string;
    durationMs?: number;
    versao?: number;
    quantidade?: number;
    origem?: string;
    integration?: string;
    [key: string]: unknown;
}
