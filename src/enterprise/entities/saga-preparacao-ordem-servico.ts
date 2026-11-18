export type EtapaSaga = 'AGUARDANDO_DIAGNOSTICO' | 'GERANDO_ORCAMENTO' | 'AGUARDANDO_APROVACAO' | 'RESERVANDO_ESTOQUE' | 'PREPARANDO_EXECUCOES' | 'AUTORIZANDO_EXECUCAO' | 'CONCLUIDA' | 'COMPENSANDO' | 'COMPENSADA' | 'INTERVENCAO_MANUAL';
export interface EstadoSaga {
    id: string;
    orderId: string;
    attempt: number;
    stage: EtapaSaga;
    version: number;
    commandId?: string;
    commandType?: string;
    snapshot?: any;
    estimateId?: string;
    estimateVersion?: number;
    expiresAt?: string;
    compensation?: number;
    error?: string;
    deadline: Date;
    compensationStartedAt?: Date;
}
const compensations = ['execution.CancelarPreparacao', 'execution.LiberarEstoque', 'billing.CancelarOrcamento'];
export class SagaPreparacaoOrdemServico {
    constructor(readonly state: EstadoSaga) { }
    retomar(now: Date) {
        const index = this.state.compensation;
        if (this.state.stage !== 'INTERVENCAO_MANUAL' || typeof index !== 'number' || !Number.isInteger(index)
            || index < 0 || index >= compensations.length) {
            throw Error('Saga não recuperável');
        }
        this.state.stage = 'COMPENSANDO';
        this.state.compensationStartedAt = now;
        this.state.commandType = compensations[index];
    }
    cancelar(reason: string, now: Date) {
        if (['CONCLUIDA', 'COMPENSADA'].includes(this.state.stage))
            throw Error('Saga encerrada');
        if (this.state.stage === 'COMPENSANDO')
            return;
        this.state.stage = 'COMPENSANDO';
        this.state.compensation = 0;
        this.state.error = reason;
        this.state.compensationStartedAt = now;
        this.state.commandType = compensations[0];
    }
    resultado(data: any, commandId: string, now: Date): string | undefined {
        const s = this.state;
        if (['CONCLUIDA', 'COMPENSADA', 'INTERVENCAO_MANUAL', 'AGUARDANDO_DIAGNOSTICO'].includes(s.stage))
            return;
        if (data.sagaId !== s.id || data.attempt !== s.attempt)
            return;
        if (s.stage === 'AGUARDANDO_APROVACAO') {
            if (data.estimateId !== s.estimateId || data.estimateVersion !== s.estimateVersion || !data.decision)
                return;
            if (data.decision === 'APPROVED' && Date.parse(s.expiresAt!) > now.getTime()) {
                s.stage = 'RESERVANDO_ESTOQUE';
                s.commandType = 'execution.ReservarEstoque';
                return;
            }
            this.cancelar('Orçamento rejeitado ou expirado', now);
            return;
        }
        if (data.commandId !== commandId || data.commandType !== s.commandType)
            return;
        if (data.ok !== true) {
            if (s.stage === 'COMPENSANDO') {
                s.error = data.error ?? 'Compensação recusada';
                s.stage = 'INTERVENCAO_MANUAL';
                return;
            }
            this.cancelar(data.error ?? 'Falha no participante', now);
            return;
        }
        if (s.stage === 'COMPENSANDO') {
            s.compensation = (s.compensation ?? 0) + 1;
            if (s.compensation === 3) {
                s.stage = 'COMPENSADA';
                s.commandType = undefined;
                return 'EM DIAGNOSTICO';
            }
            s.commandType = compensations[s.compensation];
            return;
        }
        if (s.stage === 'GERANDO_ORCAMENTO') {
            s.estimateId = data.estimateId;
            s.estimateVersion = data.estimateVersion;
            s.expiresAt = data.expiresAt;
            s.stage = 'AGUARDANDO_APROVACAO';
            s.commandType = undefined;
            return 'AGUARDANDO APROVACAO';
        }
        if (s.stage === 'RESERVANDO_ESTOQUE') {
            s.stage = 'PREPARANDO_EXECUCOES';
            s.commandType = 'execution.PrepararExecucoes';
        }
        else if (s.stage === 'PREPARANDO_EXECUCOES') {
            s.stage = 'AUTORIZANDO_EXECUCAO';
            s.commandType = 'execution.AutorizarExecucao';
        }
        else if (s.stage === 'AUTORIZANDO_EXECUCAO') {
            s.stage = 'CONCLUIDA';
            s.commandType = undefined;
            return 'EM EXECUCAO';
        }
    }
}
