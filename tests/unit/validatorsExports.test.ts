import { StatusOrcamento } from '../../src/validators/status-orcamento';
import { StatusOS } from '../../src/validators/status-os';
import { TipoMovimentacao } from '../../src/validators/tipo-movimentacao';

describe('validators exports', () => {
    test('StatusOrcamento contém valores esperados', () => {
        expect(StatusOrcamento.PENDENTE).toBe('PENDENTE');
        expect(StatusOrcamento.APROVADO).toBe('APROVADO');
        expect(StatusOrcamento.REPROVADO).toBe('REPROVADO');
        expect(StatusOrcamento.EXPIRADO).toBe('EXPIRADO');
    });

    test('StatusOS contém valores esperados', () => {
        expect(StatusOS.RECEBIDA).toBe('RECEBIDA');
        expect(StatusOS.EM_EXECUCAO).toBe('EM EXECUCAO');
        expect(StatusOS.ENTREGUE).toBe('ENTREGUE');
    });

    test('TipoMovimentacao contém valores esperados', () => {
        expect(TipoMovimentacao.ENTRADA).toBe('ENTRADA');
        expect(TipoMovimentacao.SAIDA).toBe('SAIDA');
    });
});
