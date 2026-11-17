import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { createObservabilityMock } from '../Helper/observability';

function setup(paid: boolean | Error) {
 const order = OrdemServico.restore({ id: 'order-1', cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(), status: 'FINALIZADA', dataAbertura: new Date(), pecas: [], servicos: [] });
 const check = jest.fn().mockImplementation(async () => { if (paid instanceof Error) throw paid; return paid; });
 const useCase = new AlterarStatusOrdemServicoUseCase({ createPendente: jest.fn(), isLatestOrcamentoApproved: jest.fn(), isPaymentConfirmed: check }, { assertQuantidadeDisponivel: jest.fn(), registrarSaidaOS: jest.fn() }, createObservabilityMock());
 return { order, check, useCase };
}
test('delivery is permitted only after Billing confirms payment', async () => {
 const { order, useCase, check } = setup(true); await useCase.execute(order, 'ENTREGUE');
 expect(check).toHaveBeenCalledWith('order-1'); expect(order.status.value).toBe('ENTREGUE');
});
test.each([false, new Error('billing unavailable')])('delivery fails closed for unpaid or unavailable Billing', async paid => {
 const { order, useCase } = setup(paid); await expect(useCase.execute(order, 'ENTREGUE')).rejects.toThrow();
 expect(order.status.value).toBe('FINALIZADA');
});
