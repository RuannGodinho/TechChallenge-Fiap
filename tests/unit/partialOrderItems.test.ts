import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';

const oldPart = new ObjectId().toString(), newPart = new ObjectId().toString();
const oldService = new ObjectId().toString(), newService = new ObjectId().toString();
function setup(status = 'EM DIAGNOSTICO') {
    const order = OrdemServico.restore({ id: new ObjectId().toString(), cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(),
        status, dataAbertura: new Date(), pecas: [{ pecaId: oldPart, quantidade: 2, valorUnitario: 1 }], servicos: [oldService], valorTotal: 3 });
    const parts = { findById: jest.fn(async (id: string) => ({ id, nome: 'Peça', descricao: 'Peça de teste', tipo: 'PECA', preco: id === newPart ? 30 : 35 })) };
    const services = { findById: jest.fn(async (id: string) => ({ id, nome: 'Serviço', descricao: 'Serviço de teste', preco: id === newService ? 120 : 100 })) };
    const stock = { assertQuantidadeDisponivel: jest.fn().mockResolvedValue(undefined), registrarSaidaOS: jest.fn() };
    const billing = { createPendente: jest.fn().mockResolvedValue(undefined), isLatestOrcamentoApproved: jest.fn() };
    return { order, parts, services, stock, billing, useCase: new AtualizarItensOrdemServicoUseCase(parts, services, stock, billing, { emit() {} }) };
}

describe.each([false, true])('partial diagnosis items with managed = %s', managed => {
    test('retains omitted services and reloads their current prices on a parts-only edit', async () => {
        const c = setup();
        const snapshot = await c.useCase.execute(c.order, { pecas: [{ pecaId: newPart, quantidade: 3 }] }, managed);
        expect(c.order.servicos).toEqual([oldService]);
        expect(c.order.pecas.map(item => item.pecaId.value)).toEqual([newPart]);
        expect(c.order.valorTotal).toBe(190);
        expect(c.services.findById).toHaveBeenCalledWith(oldService);
        const budget = snapshot!;
        expect(budget.valorTotal).toBe(190);
        expect(budget.servicos.map((item: { id: string }) => item.id)).toEqual([oldService]);
        expect(c.billing.createPendente).not.toHaveBeenCalled();
        expect(c.order.status.value).toBe(managed ? 'EM DIAGNOSTICO' : 'AGUARDANDO APROVACAO');
    });
    test('retains omitted parts and recomputes their prices on a services-only edit', async () => {
        const c = setup();
        const snapshot = await c.useCase.execute(c.order, { servicos: [newService] }, managed);
        expect(c.order.pecas.map(item => ({ id: item.pecaId.value, quantidade: item.quantidade, price: item.valorUnitario })))
            .toEqual([{ id: oldPart, quantidade: 2, price: 35 }]);
        expect(c.order.servicos).toEqual([newService]);
        expect(c.order.valorTotal).toBe(190);
        expect(c.parts.findById).toHaveBeenCalledWith(oldPart);
        expect(c.stock.assertQuantidadeDisponivel).toHaveBeenCalledWith(oldPart, 2);
        const budget = snapshot!;
        expect(budget.valorTotal).toBe(190);
        expect(budget.pecas.map((item: { id: string }) => item.id)).toEqual([oldPart]);
    });
});
test('respects an explicitly empty service list when updating parts', async () => {
    const c = setup();
    await c.useCase.execute(c.order, { pecas: [{ pecaId: newPart, quantidade: 1 }], servicos: [] }, true);
    expect(c.order.servicos).toEqual([]);
    expect(c.order.valorTotal).toBe(30);
    expect(c.services.findById).not.toHaveBeenCalled();
});

test.each([
    { name: 'services', input: { servicos: [newService] }, parts: [oldPart], services: [newService], total: 190 },
    { name: 'parts', input: { pecas: [{ pecaId: newPart, quantidade: 3 }] }, parts: [newPart], services: [oldService], total: 190 },
    { name: 'both lists', input: { pecas: [{ pecaId: newPart, quantidade: 3 }], servicos: [newService] }, parts: [newPart], services: [newService], total: 210 },
])('persists $name for a managed RECEBIDA order without starting diagnosis', async ({ input, parts, services, total }) => {
    const c = setup('RECEBIDA');
    // Keep persisted state separate: processing the loaded entity alone is not a save.
    const persisted = OrdemServico.restore({ id: c.order.id, cpfCnpj: c.order.cpfCnpj.value, veiculoId: c.order.veiculoId.value,
        status: 'RECEBIDA', dataAbertura: c.order.dataAbertura, pecas: [{ pecaId: oldPart, quantidade: 2, valorUnitario: 1 }], servicos: [oldService], valorTotal: 3 });
    const gateway = {
        findById: jest.fn().mockResolvedValue(c.order), findAll: jest.fn(), findByCpfCnpj: jest.fn(), save: jest.fn(),
        update: jest.fn(async (_id: string, changes: Partial<OrdemServico>) => Object.assign(persisted, changes)),
    };
    const saga = { gerenciada: jest.fn().mockResolvedValue(true), validarEdicao: jest.fn().mockResolvedValue(undefined),
        repetirDiagnostico: jest.fn(), salvarDiagnostico: jest.fn(), criar: jest.fn() };
    const execution = { createExecucoesParaServicos: jest.fn() };
    const useCase = new AtualizarOrdemServicoUseCase(gateway, { existsByCpf: jest.fn() }, { existsById: jest.fn() }, execution,
        { execute: jest.fn() } as unknown as AlterarStatusOrdemServicoUseCase, c.useCase, saga);

    const updated = await useCase.execute(c.order.id!, input);

    expect(updated).toBe(persisted);
    expect(persisted.pecas.map(item => item.pecaId.value)).toEqual(parts);
    expect(persisted.servicos).toEqual(services);
    expect(persisted.valorTotal).toBe(total);
    expect(persisted.status.value).toBe('RECEBIDA');
    expect(saga.validarEdicao).toHaveBeenCalledWith(c.order.id, undefined);
    expect(saga.salvarDiagnostico).not.toHaveBeenCalled();
    expect(c.billing.createPendente).not.toHaveBeenCalled();
    expect(execution.createExecucoesParaServicos).not.toHaveBeenCalled();
});
