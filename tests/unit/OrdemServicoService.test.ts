import { OrdemServicoService } from '../../src/services/ordem-servico-service';
import { OrdemServico } from '../../src/Entities/ordem-servico';
import { OrdemPecaItem } from '../../src/ValueObjects/ordem-peca-item';
import { StatusOS } from '../../src/validators/status-os';
import { ObjectId } from 'mongodb';

// Mocks
const mockOrdemServicoRepository = {
  createOrdemServico: jest.fn(),
  listaOrdensServico: jest.fn(),
  updateOrdemServico: jest.fn(),
  getOSById: jest.fn(),
};

const mockClienteService = {
  getClienteByCpf: jest.fn(),
};

const mockVeiculoService = {
  getVeiculoById: jest.fn(),
};

const mockPecaService = {
  getPecaById: jest.fn(),
};

const mockServicoService = {
  getServicoById: jest.fn(),
};

const mockEstoqueService = {
  getEstoqueByPecaId: jest.fn(),
  updateEstoque: jest.fn(),
  createMovimentacao: jest.fn()
};

const mockOrcamentoService = {
  createOrcamento: jest.fn(),
  enviaEmailCliente: jest.fn()
};

const mockExecucaoServicoService = {
  createExecucoesParaServicos: jest.fn()
};

describe('OrdemServicoService', () => {
  let service: OrdemServicoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdemServicoService(
      mockOrdemServicoRepository as any,
      mockClienteService as any,
      mockVeiculoService as any,
      mockPecaService as any,
      mockServicoService as any,
      mockEstoqueService as any,
      mockOrcamentoService as any,
      mockExecucaoServicoService as any
    );
  });

  describe('createOrdemServico', () => {
    test('deve criar ordem de serviço com sucesso', async () => {
      const ordemData = {
        cpfCnpj: '11144477735',
        veiculo: new ObjectId(),
        pecas: [],
        servicos: [],
      };

      mockClienteService.getClienteByCpf.mockResolvedValue({ id: 'cliente1' });
      mockVeiculoService.getVeiculoById.mockResolvedValue({ id: 'veiculo1' });
      mockOrdemServicoRepository.createOrdemServico.mockResolvedValue(undefined);

      const result = await service.createOrdemServico(ordemData as any);

      expect(result).toBeInstanceOf(OrdemServico);
      expect(result.cpfCnpj).toBe('11144477735');
      expect(result.status).toBe('RECEBIDA');
      expect(mockClienteService.getClienteByCpf).toHaveBeenCalledWith('11144477735');
      expect(mockVeiculoService.getVeiculoById).toHaveBeenCalled();
      expect(mockOrdemServicoRepository.createOrdemServico).toHaveBeenCalled();
    });

    test('deve lançar erro para CPF inválido', async () => {
      const ordemData = {
        cpfCnpj: '11144477736', // CPF inválido
        veiculo: new ObjectId(),
        pecas: [],
        servicos: [],
      };

      await expect(service.createOrdemServico(ordemData as any)).rejects.toThrow('CPF/CNPJ inválido');
    });

    test('deve lançar erro para cliente não encontrado', async () => {
      const ordemData = {
        cpfCnpj: '11144477735',
        veiculo: new ObjectId(),
        pecas: [],
        servicos: [],
      };

      mockClienteService.getClienteByCpf.mockResolvedValue(null);

      await expect(service.createOrdemServico(ordemData as any)).rejects.toThrow('Cliente não encontrado para o CPF/CNPJ fornecido.');
    });

    test('deve lançar erro para veículo não encontrado', async () => {
      const ordemData = {
        cpfCnpj: '11144477735',
        veiculo: new ObjectId(),
        pecas: [],
        servicos: [],
      };

      mockClienteService.getClienteByCpf.mockResolvedValue({ id: 'cliente1' });
      mockVeiculoService.getVeiculoById.mockResolvedValue(null);

      await expect(service.createOrdemServico(ordemData as any)).rejects.toThrow('Veículo não encontrado para o ID fornecido.');
    });
  });

  describe('listaOrdensServico', () => {
    test('deve listar todas as ordens de serviço', async () => {
      const ordensMock = [
        new OrdemServico('11144477735', new ObjectId(), StatusOS.RECEBIDA, new Date(), [], []),
        new OrdemServico('22255588899', new ObjectId(), StatusOS.FINALIZADA, new Date(), [], []),
      ];

      mockOrdemServicoRepository.listaOrdensServico.mockResolvedValue(ordensMock);

      const result = await service.listaOrdensServico();

      expect(result).toEqual(ordensMock);
      expect(mockOrdemServicoRepository.listaOrdensServico).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOrdemServico', () => {
    test('deve atualizar ordem de serviço com sucesso', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updates = { status: StatusOS.EM_DIAGNOSTICO };
      const ordemExistente = new OrdemServico('11144477735', new ObjectId(), StatusOS.RECEBIDA, new Date(), [], []);

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockOrdemServicoRepository.updateOrdemServico.mockResolvedValue(ordemExistente);

      const result = await service.updateOrdemServico(id, updates);

      expect(result).toEqual(ordemExistente);
      expect(mockOrdemServicoRepository.getOSById).toHaveBeenCalledWith(id);
      expect(mockOrdemServicoRepository.updateOrdemServico).toHaveBeenCalledWith(id, updates);
    });

    test('deve lançar erro para ordem não encontrada', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updates = { status: 'EM_DIAGNOSTICO' as any };

      mockOrdemServicoRepository.getOSById.mockResolvedValue(null);

      await expect(service.updateOrdemServico(id, updates)).rejects.toThrow(`Ordem de serviço não encontrada para o id ${id}.`);
    });

    test('deve lançar erro para status inválido', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updates = { status: 'STATUS_INVALIDO' as any };
      const ordemExistente = new OrdemServico('11144477735', new ObjectId(), StatusOS.RECEBIDA, new Date(), [], []);

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);

      await expect(service.updateOrdemServico(id, updates)).rejects.toThrow('Status inválido');
    });

    test('deve criar orçamento quando status muda para AGUARDANDO_APROVACAO', async () => {
      const id = '507f1f77bcf86cd799439011';
      const pecaId = new ObjectId();
      const servicoId = new ObjectId();

      const updates = {
        pecas: [new OrdemPecaItem(pecaId, 2, 100)],
        servicos: [servicoId],
        valorTotal: 300,
      };

      const ordemExistente = new OrdemServico(
        '11144477735',
        new ObjectId(),
        StatusOS.EM_DIAGNOSTICO,
        new Date(),
        [new OrdemPecaItem(pecaId, 2, 100)],
        [servicoId]
      );

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockPecaService.getPecaById.mockResolvedValue({ id: pecaId.toString(), nome: 'Peça Teste', preco: 100 });
      mockServicoService.getServicoById.mockResolvedValue({ id: servicoId.toString(), nome: 'Serviço Teste', preco: 100 });
      mockEstoqueService.getEstoqueByPecaId.mockResolvedValue({ pecaId: pecaId.toString(), quantidade: 10 });
      mockOrcamentoService.createOrcamento.mockResolvedValue(undefined);
      mockOrcamentoService.enviaEmailCliente.mockResolvedValue(undefined);
      mockOrdemServicoRepository.updateOrdemServico.mockResolvedValue(ordemExistente);

      const result = await service.updateOrdemServico(id, updates);

      expect(mockOrcamentoService.createOrcamento).toHaveBeenCalled();
      expect(mockOrcamentoService.enviaEmailCliente).toHaveBeenCalled();
      expect(result).toEqual(ordemExistente);
    });

    test('deve consumir estoque quando status muda para EM_EXECUCAO', async () => {
      const id = '507f1f77bcf86cd799439011';
      const pecaId = new ObjectId();
      const servicoId = new ObjectId();

      const updates = { status: StatusOS.EM_EXECUCAO };

      const ordemExistente = new OrdemServico(
        '11144477735',
        new ObjectId(),
        StatusOS.AGUARDANDO_APROVACAO,
        new Date(),
        [new OrdemPecaItem(pecaId, 2, 100)],
        [servicoId]
      );

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockEstoqueService.getEstoqueByPecaId.mockResolvedValue({ pecaId: pecaId.toString(), quantidade: 10 });
      mockServicoService.getServicoById.mockResolvedValue({ id: servicoId.toString(), nome: 'Serviço Teste', preco: 100 });
      mockEstoqueService.updateEstoque.mockResolvedValue(undefined);
      mockOrdemServicoRepository.updateOrdemServico.mockResolvedValue(ordemExistente);

      const result = await service.updateOrdemServico(id, updates);

      expect(mockEstoqueService.getEstoqueByPecaId)
        .toHaveBeenCalledWith(pecaId);

      expect(mockEstoqueService.createMovimentacao)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            pecaId: pecaId,
            tipo: 'SAIDA',
            quantidade: 2,
            origem: 'OS'
          })
        );
      expect(result).toEqual(ordemExistente);
    });

    test('deve lançar erro quando estoque insuficiente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const pecaId = new ObjectId();
      const servicoId = new ObjectId();

      const updates = { status: StatusOS.EM_EXECUCAO };

      const ordemExistente = new OrdemServico(
        '11144477735',
        new ObjectId(),
        StatusOS.AGUARDANDO_APROVACAO,
        new Date(),
        [new OrdemPecaItem(pecaId, 5, 100)], // Solicita 5 unidades
        [servicoId]
      );

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockEstoqueService.getEstoqueByPecaId.mockResolvedValue({ pecaId: pecaId.toString(), quantidade: 3 }); // Apenas 3 disponíveis
      mockServicoService.getServicoById.mockResolvedValue({ id: servicoId.toString(), nome: 'Serviço Teste', preco: 100 });

      await expect(service.updateOrdemServico(id, updates)).rejects.toThrow('Quantidade insuficiente em estoque');
    });

    test('deve lançar erro quando peça não encontrada', async () => {
      const id = '507f1f77bcf86cd799439011';
      const pecaId = new ObjectId();

      const updates = {
        pecas: [new OrdemPecaItem(pecaId, 2, 100)],
        servicos: [new ObjectId()], // Adicionar serviços também
      };

      const ordemExistente = new OrdemServico(
        '11144477735',
        new ObjectId(),
        StatusOS.EM_DIAGNOSTICO,
        new Date(),
        [],
        []
      );

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockPecaService.getPecaById.mockResolvedValue(null);

      await expect(service.updateOrdemServico(id, updates)).rejects.toThrow(`Peça não encontrada para o ID ${pecaId.toString()}`);
    });

    test('deve lançar erro quando serviço não encontrado', async () => {
      const id = '507f1f77bcf86cd799439011';
      const servicoId = new ObjectId();
      const pecaId = new ObjectId();

      const updates = {
        pecas: [new OrdemPecaItem(pecaId, 2, 100)],
        servicos: [servicoId],
      };

      const ordemExistente = new OrdemServico(
        '11144477735',
        new ObjectId(),
        StatusOS.EM_DIAGNOSTICO,
        new Date(),
        [],
        []
      );

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockPecaService.getPecaById.mockResolvedValue({ id: pecaId.toString(), nome: 'Peça Teste', preco: 100 });
      mockServicoService.getServicoById.mockResolvedValue(null);

      await expect(service.updateOrdemServico(id, updates)).rejects.toThrow(`Serviço não encontrado para o ID ${servicoId.toString()}`);
    });

    test('deve validar CPF ao atualizar', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updates = { cpfCnpj: '11144477735' };
      const ordemExistente = new OrdemServico('22255588899', new ObjectId(), StatusOS.RECEBIDA, new Date(), [], []);

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockClienteService.getClienteByCpf.mockResolvedValue({ id: 'cliente1' });
      mockOrdemServicoRepository.updateOrdemServico.mockResolvedValue(ordemExistente);

      const result = await service.updateOrdemServico(id, updates);

      expect(mockClienteService.getClienteByCpf).toHaveBeenCalledWith('11144477735');
      expect(result).toEqual(ordemExistente);
    });

    test('deve validar veículo ao atualizar', async () => {
      const id = '507f1f77bcf86cd799439011';
      const veiculoId = new ObjectId();
      const updates = { veiculo: veiculoId };
      const ordemExistente = new OrdemServico('11144477735', new ObjectId(), StatusOS.RECEBIDA, new Date(), [], []);

      mockOrdemServicoRepository.getOSById.mockResolvedValue(ordemExistente);
      mockVeiculoService.getVeiculoById.mockResolvedValue({ id: 'veiculo1' });
      mockOrdemServicoRepository.updateOrdemServico.mockResolvedValue(ordemExistente);

      const result = await service.updateOrdemServico(id, updates);

      expect(mockVeiculoService.getVeiculoById).toHaveBeenCalled();
      expect(result).toEqual(ordemExistente);
    });
  });
});