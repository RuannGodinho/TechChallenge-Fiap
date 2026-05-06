import { ExecucaoServicoService } from '../../src/services/execucao-servico-service';
import { ObjectId } from 'mongodb';
import { ExecucaoServico } from '../../src/Entities/execucao-servico';

describe('ExecucaoServicoService', () => {
  const mockRepo = {
    createExecucaoServico: jest.fn(),
    createExecucoesServico: jest.fn(),
    getExecucaoById: jest.fn(),
    updateExecucao: jest.fn(),
    getExecucoesFinalizadas: jest.fn(),
  };

  const mockOrdemRepo = {
    getOSById: jest.fn(),
  };

  const mockServicoService = {
    getServicoById: jest.fn(),
  };

  let service: ExecucaoServicoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExecucaoServicoService(mockRepo as any, mockOrdemRepo as any, mockServicoService as any);
  });

  test('deve criar execução pendente com sucesso', async () => {
    const ordemId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    mockOrdemRepo.getOSById.mockResolvedValue({ _id: new ObjectId(ordemId) });
    mockServicoService.getServicoById.mockResolvedValue({ _id: new ObjectId(servicoId) });

    const result = await service.createExecucaoServico(ordemId, servicoId);

    expect(mockRepo.createExecucaoServico).toHaveBeenCalledWith(
      expect.objectContaining({
        ordemServicoId: expect.any(ObjectId),
        servicoId: expect.any(ObjectId),
        status: 'PENDENTE',
        iniciadoEm: null,
        finalizadoEm: null,
      })
    );
    expect(result.status).toBe('PENDENTE');
    expect(result.ordemServicoId.toString()).toBe(ordemId);
    expect(result.servicoId.toString()).toBe(servicoId);
  });

  test('deve retornar erro quando ordem não existir', async () => {
    const ordemId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    mockOrdemRepo.getOSById.mockResolvedValue(null);

    await expect(service.createExecucaoServico(ordemId, servicoId)).rejects.toThrow(
      `Ordem de serviço não encontrada para o id ${ordemId}.`
    );
  });

  test('deve iniciar execução apenas quando pendente', async () => {
    const execucao = new ExecucaoServico(new ObjectId(), new ObjectId(), 'PENDENTE', null, null, new Date());
    mockRepo.getExecucaoById.mockResolvedValue(execucao);
    mockRepo.updateExecucao.mockResolvedValue({ ...execucao, status: 'EM EXECUCAO', iniciadoEm: new Date() });

    const result = await service.iniciarExecucao(new ObjectId().toString());

    expect(result.status).toBe('EM EXECUCAO');
    expect(mockRepo.updateExecucao).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: 'EM EXECUCAO' }));
  });

  test('deve rejeitar iniciar execução já iniciada', async () => {
    const execucao = new ExecucaoServico(new ObjectId(), new ObjectId(), 'EM EXECUCAO', new Date(), null, new Date());
    mockRepo.getExecucaoById.mockResolvedValue(execucao);

    await expect(service.iniciarExecucao(new ObjectId().toString())).rejects.toThrow('Execução já iniciada.');
  });

  test('deve finalizar execução somente quando em execução', async () => {
    const execucao = new ExecucaoServico(new ObjectId(), new ObjectId(), 'EM EXECUCAO', new Date(), null, new Date());
    mockRepo.getExecucaoById.mockResolvedValue(execucao);
    mockRepo.updateExecucao.mockResolvedValue({ ...execucao, status: 'FINALIZADO', finalizadoEm: new Date() });

    const result = await service.finalizarExecucao(new ObjectId().toString());

    expect(result.status).toBe('FINALIZADO');
    expect(result.finalizadoEm).not.toBeNull();
  });

  test('deve calcular métricas de tempo médio corretamente', async () => {
    const agora = new Date();
    const execucoes = [
      new ExecucaoServico(new ObjectId(), new ObjectId(), 'FINALIZADO', new Date(agora.getTime() - 30 * 60000), agora, new Date()),
      new ExecucaoServico(new ObjectId(), new ObjectId(), 'FINALIZADO', new Date(agora.getTime() - 60 * 60000), agora, new Date()),
    ];

    mockRepo.getExecucoesFinalizadas.mockResolvedValue(execucoes);

    const metrics = await service.getTempoMedioServicos();

    expect(metrics.totalServicosFinalizados).toBe(2);
    expect(metrics.tempoMedioMinutos).toBe(45);
    expect(metrics.maisRapidoMinutos).toBe(30);
    expect(metrics.maisLentoMinutos).toBe(60);
  });
});
