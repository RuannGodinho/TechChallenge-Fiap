import { SagaPreparacaoOrdemServico, EstadoSaga } from '../../src/enterprise/entities/saga-preparacao-ordem-servico';
const now = new Date();
function state(): EstadoSaga { return { id: 'saga', orderId: 'os', attempt: 1, version: 0, stage: 'AGUARDANDO_APROVACAO', estimateId: 'estimate', estimateVersion: 1, expiresAt: new Date(now.getTime() + 60000).toISOString(), deadline: now }; }
test('approval only advances the pinned estimate and attempt', () => { const s = state(), entity = new SagaPreparacaoOrdemServico(s); entity.resultado({ sagaId: 'saga', attempt: 2, estimateId: 'estimate', estimateVersion: 1, decision: 'APPROVED' }, '', now); expect(s.stage).toBe('AGUARDANDO_APROVACAO'); entity.resultado({ sagaId: 'saga', attempt: 1, estimateId: 'estimate', estimateVersion: 1, decision: 'APPROVED' }, '', now); expect(s.stage).toBe('RESERVANDO_ESTOQUE'); });
test('rejection compensates and does not erase history', () => { const s = state(); new SagaPreparacaoOrdemServico(s).resultado({ sagaId: 'saga', attempt: 1, estimateId: 'estimate', estimateVersion: 1, decision: 'REJECTED' }, '', now); expect(s.stage).toBe('COMPENSANDO'); expect(s.commandType).toBe('execution.CancelarPreparacao'); });
test('completed saga cannot be cancelled', () => { const s = state(); s.stage = 'CONCLUIDA'; expect(() => new SagaPreparacaoOrdemServico(s).cancelar('cancel', now)).toThrow('encerrada'); });
test.each([
    [0, 'execution.CancelarPreparacao'],
    [1, 'execution.LiberarEstoque'],
    [2, 'billing.CancelarOrcamento'],
] as const)('resumes timed-out compensation at saved step %i', (compensation, command) => {
    const s = { ...state(), stage: 'INTERVENCAO_MANUAL' as const, compensation, commandType: undefined };
    new SagaPreparacaoOrdemServico(s).retomar(now);
    expect(s.stage).toBe('COMPENSANDO');
    expect(s.commandType).toBe(command);
    expect(s.compensation).toBe(compensation);
    expect(s.compensationStartedAt).toBe(now);
});
test.each([undefined, -1, 3, 0.5])('rejects manual recovery with an invalid compensation index %s', compensation => {
    const s = { ...state(), stage: 'INTERVENCAO_MANUAL' as const, compensation };
    expect(() => new SagaPreparacaoOrdemServico(s).retomar(now)).toThrow('não recuperável');
    expect(s.stage).toBe('INTERVENCAO_MANUAL');
});
