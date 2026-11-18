import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';

const partId = new ObjectId().toString(), serviceId = new ObjectId().toString();
const input = { pecas: [{ pecaId: partId, quantidade: 2 }], servicos: [serviceId] };
function setup(status = 'EM DIAGNOSTICO', managed = false) {
    const order = OrdemServico.restore({ id: new ObjectId().toString(), cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(),
        status, dataAbertura: new Date(), pecas: [], servicos: [] });
    const sequence: string[] = [];
    const billing = { createPendente: jest.fn(async (_snapshot: unknown) => { sequence.push('quote'); }), isLatestOrcamentoApproved: jest.fn() };
    const gateway = {
        findById: jest.fn().mockResolvedValue(order), findAll: jest.fn(), findByCpfCnpj: jest.fn(), save: jest.fn(),
        update: jest.fn(async (_id: string, changes: Partial<OrdemServico>, _expectedStatus: string): Promise<OrdemServico | null> => {
            sequence.push('commit'); return Object.assign(order, changes);
        }),
    };
    const stock = { assertQuantidadeDisponivel: jest.fn(), registrarSaidaOS: jest.fn() };
    const items = new AtualizarItensOrdemServicoUseCase(
        { findById: async id => ({ id, nome: 'Filtro', descricao: 'Filtro de óleo', tipo: 'PECA', preco: 35 }) },
        { findById: async id => ({ id, nome: 'Troca', descricao: 'Troca de óleo', preco: 100 }) }, stock, billing, { emit() {} });
    const saga = { gerenciada: jest.fn().mockResolvedValue(managed), validarEdicao: jest.fn(), repetirDiagnostico: jest.fn(),
        criar: jest.fn(), salvarDiagnostico: jest.fn().mockResolvedValue(order) };
    const useCase = new AtualizarOrdemServicoUseCase(gateway, { existsByCpf: jest.fn() }, { existsById: jest.fn() },
        { createExecucoesParaServicos: jest.fn() }, new AlterarStatusOrdemServicoUseCase(billing, stock, { emit() {} }), items, saga);
    return { order, sequence, billing, gateway, saga, useCase };
}

test.each(['conflict', 'database failure', 'missing order'])('does not create a quote after a rejected guarded write: %s', async reason => {
    const c = setup();
    if (reason === 'missing order') c.gateway.update.mockResolvedValue(null);
    else c.gateway.update.mockRejectedValue(new Error(reason === 'conflict' ? 'Conflito: alteração concorrente' : 'MongoDB unavailable'));
    await expect(c.useCase.execute(c.order.id!, input)).rejects.toThrow();
    expect(c.billing.createPendente).not.toHaveBeenCalled();
    expect(c.gateway.update).toHaveBeenCalledWith(c.order.id, expect.anything(), 'EM DIAGNOSTICO');
});

test('waits for the guarded commit before creating the quote with the accepted snapshot', async () => {
    const c = setup();
    let release!: () => void, reached!: () => void;
    const blocked = new Promise<void>(resolve => { release = resolve; });
    const committing = new Promise<void>(resolve => { reached = resolve; });
    c.gateway.update.mockImplementation(async (_id, changes) => {
        reached(); await blocked; c.sequence.push('commit'); return Object.assign(c.order, changes);
    });
    const pending = c.useCase.execute(c.order.id!, input);
    await committing;
    try { expect(c.billing.createPendente).not.toHaveBeenCalled(); }
    finally { release(); }
    const saved = await pending;
    expect(c.sequence).toEqual(['commit', 'quote']);
    expect(saved.status.value).toBe('AGUARDANDO APROVACAO');
    expect(c.billing.createPendente).toHaveBeenCalledTimes(1);
    expect(c.billing.createPendente).toHaveBeenCalledWith({ ordemServicoId: c.order.id, valorTotal: 170,
        pecas: [{ id: partId, nome: 'Filtro', descricao: 'Filtro de óleo', tipo: 'PECA', preco: 35, quantidade: 2 }],
        servicos: [{ id: serviceId, nome: 'Troca', descricao: 'Troca de óleo', preco: 100 }] });
});

test('leaves managed diagnosis submission on its transactional Saga path', async () => {
    const c = setup('EM DIAGNOSTICO', true);
    await c.useCase.execute(c.order.id!, input, 'diagnosis-key');
    expect(c.saga.salvarDiagnostico).toHaveBeenCalledTimes(1);
    expect(c.gateway.update).not.toHaveBeenCalled();
    expect(c.billing.createPendente).not.toHaveBeenCalled();
});

test('does not create a quote for an item edit before diagnosis', async () => {
    const c = setup('RECEBIDA');
    await c.useCase.execute(c.order.id!, input);
    expect(c.gateway.update).toHaveBeenCalledTimes(1);
    expect(c.billing.createPendente).not.toHaveBeenCalled();
});

test('surfaces a post-commit Billing failure instead of claiming quote creation succeeded', async () => {
    const c = setup();
    c.billing.createPendente.mockRejectedValue(new Error('Billing unavailable'));
    await expect(c.useCase.execute(c.order.id!, input)).rejects.toThrow('Billing unavailable');
    expect(c.gateway.update).toHaveBeenCalledTimes(1);
    expect(c.sequence).toEqual(['commit']);
});
