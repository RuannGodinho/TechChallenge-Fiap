import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { IOrdemServicoGateway } from '../../src/application/ports/ordem-servico.gateway.port';
import { ISagaPreparacaoPort } from '../../src/application/ports/saga-preparacao.port';

const id = new ObjectId().toString(), veiculoId = new ObjectId().toString();
function order(status: string) {
    return OrdemServico.restore({ id, cpfCnpj: '11144477735', veiculoId, status, dataAbertura: new Date(), pecas: [], servicos: [] });
}
function setup(status: string) {
    const gateway: jest.Mocked<IOrdemServicoGateway> = {
        findById: jest.fn().mockResolvedValue(order(status)), findAll: jest.fn(), findByCpfCnpj: jest.fn(), save: jest.fn(), update: jest.fn(),
    };
    const saga: jest.Mocked<ISagaPreparacaoPort> = {
        gerenciada: jest.fn().mockResolvedValue(true), repetirDiagnostico: jest.fn().mockResolvedValue(null),
        validarEdicao: jest.fn(), criar: jest.fn(), salvarDiagnostico: jest.fn(),
    };
    const statusUseCase = { execute: jest.fn() };
    const items = { execute: jest.fn() };
    const useCase = new AtualizarOrdemServicoUseCase(gateway, { existsByCpf: jest.fn() }, { existsById: jest.fn() },
        { createExecucoesParaServicos: jest.fn() }, statusUseCase as unknown as AlterarStatusOrdemServicoUseCase,
        items as unknown as AtualizarItensOrdemServicoUseCase, saga);
    return { gateway, saga, items, useCase };
}

test.each(['EM EXECUCAO', 'FINALIZADA', 'ENTREGUE'])('replays the accepted diagnosis after the order reaches %s', async status => {
    const context = setup(status), input = { servicos: [new ObjectId().toString()] }, accepted = order('EM DIAGNOSTICO');
    context.saga.repetirDiagnostico.mockResolvedValue(accepted);
    await expect(context.useCase.execute(id, input, 'accepted-key')).resolves.toBe(accepted);
    expect(context.saga.repetirDiagnostico).toHaveBeenCalledWith(id, 'accepted-key', input);
    expect(context.saga.validarEdicao).not.toHaveBeenCalled();
    expect(context.items.execute).not.toHaveBeenCalled();
    expect(context.gateway.update).not.toHaveBeenCalled();
});
test.each(['EM EXECUCAO', 'FINALIZADA', 'ENTREGUE'])('still rejects a new keyed item edit in %s', async status => {
    const context = setup(status);
    await expect(context.useCase.execute(id, { servicos: [] }, 'new-key')).rejects.toThrow('imutáveis');
    expect(context.gateway.update).not.toHaveBeenCalled();
});
test('retains the payload conflict when a diagnosis key is reused with different items', async () => {
    const context = setup('ENTREGUE');
    context.saga.repetirDiagnostico.mockRejectedValue(new Error('Conflito: chave reutilizada com outros dados'));
    await expect(context.useCase.execute(id, { servicos: [] }, 'accepted-key')).rejects.toThrow('outros dados');
});
