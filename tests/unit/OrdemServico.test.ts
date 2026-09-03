import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { StatusOS } from '../../src/enterprise/value-objects/status-os.vo';

describe('OrdemServico entity', () => {
    const veiculoId = new ObjectId().toString();

    test('deve criar ordem com status RECEBIDA', () => {
        const ordem = OrdemServico.create({
            cpfCnpj: '11144477735',
            veiculoId,
            pecas: [],
            servicos: [],
        });

        expect(ordem.status.value).toBe('RECEBIDA');
        expect(ordem.cpfCnpj.value).toBe('11144477735');
        expect(ordem.veiculoId.value).toBe(veiculoId);
    });

    test('deve validar transição de status permitida', () => {
        const ordem = OrdemServico.create({
            cpfCnpj: '11144477735',
            veiculoId,
        });

        ordem.transicionarStatus(StatusOS.from('EM DIAGNOSTICO'));

        expect(ordem.status.value).toBe('EM DIAGNOSTICO');
    });

    test('deve rejeitar transição de status inválida', () => {
        const ordem = OrdemServico.create({
            cpfCnpj: '11144477735',
            veiculoId,
        });

        expect(() => ordem.transicionarStatus(StatusOS.from('EM EXECUCAO'))).toThrow(
            'Não é permitido alterar status de RECEBIDA para EM EXECUCAO'
        );
    });

    test('deve promover para aguardando aprovação a partir de diagnóstico', () => {
        const ordem = OrdemServico.create({
            cpfCnpj: '11144477735',
            veiculoId,
        });

        ordem.transicionarStatus(StatusOS.from('EM DIAGNOSTICO'));
        ordem.promoverParaAguardandoAprovacao();

        expect(ordem.status.value).toBe('AGUARDANDO APROVACAO');
    });

    test('deve identificar status visíveis e excluídos da listagem', () => {
        expect(StatusOS.from('EM EXECUCAO').isVisivelNaListagem()).toBe(true);
        expect(StatusOS.from('AGUARDANDO APROVACAO').isVisivelNaListagem()).toBe(true);
        expect(StatusOS.from('EM DIAGNOSTICO').isVisivelNaListagem()).toBe(true);
        expect(StatusOS.from('RECEBIDA').isVisivelNaListagem()).toBe(true);
        expect(StatusOS.from('FINALIZADA').isVisivelNaListagem()).toBe(false);
        expect(StatusOS.from('ENTREGUE').isVisivelNaListagem()).toBe(false);
    });

    test('deve registrar statusEnteredAt na criação e ao transicionar', () => {
        const ordem = OrdemServico.create({
            cpfCnpj: '11144477735',
            veiculoId,
        });

        expect(ordem.statusEnteredAt).toEqual(ordem.dataAbertura);

        const enteredAt = new Date(Date.now() - 5 * 60_000);
        ordem.statusEnteredAt = enteredAt;

        const transition = ordem.transicionarStatus(StatusOS.from('EM DIAGNOSTICO'));

        expect(transition.from).toBe('RECEBIDA');
        expect(transition.to).toBe('EM DIAGNOSTICO');
        expect(transition.durationMs).toBeGreaterThanOrEqual(5 * 60_000);
        expect(ordem.statusEnteredAt.getTime()).toBeGreaterThan(enteredAt.getTime());
    });

    test('deve usar dataAbertura quando restore não tem statusEnteredAt', () => {
        const dataAbertura = new Date('2026-01-01T00:00:00Z');
        const ordem = OrdemServico.restore({
            id: 'ordem-1',
            cpfCnpj: '11144477735',
            veiculoId,
            status: 'RECEBIDA',
            dataAbertura,
            pecas: [],
            servicos: [],
        });

        expect(ordem.statusEnteredAt).toEqual(dataAbertura);
    });

    test('deve definir prioridade de listagem por status', () => {
        expect(StatusOS.from('EM EXECUCAO').prioridadeListagem()).toBe(1);
        expect(StatusOS.from('AGUARDANDO APROVACAO').prioridadeListagem()).toBe(2);
        expect(StatusOS.from('EM DIAGNOSTICO').prioridadeListagem()).toBe(3);
        expect(StatusOS.from('RECEBIDA').prioridadeListagem()).toBe(4);
    });
});
