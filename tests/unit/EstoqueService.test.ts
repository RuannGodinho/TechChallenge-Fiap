import { EstoqueService } from '../../src/services/EstoqueService';
import { ObjectId } from 'mongodb';
import { Estoque } from '../../src/Entities/Estoque/Estoque';
import { MovimentacaoEstoque } from '../../src/Entities/Estoque/MovimentacaoEstoque';

describe('EstoqueService', () => {
  const getAllEstoqueMock = jest.fn();
  const getEstoqueByPecaIdMock = jest.fn();
  const createEstoqueMock = jest.fn();
  const updateEstoqueMock = jest.fn();
  const deleteEstoqueMock = jest.fn();
  const createMovimentacaoMock = jest.fn();
  const listaMovimentacoesMock = jest.fn();
  const getPecaByIdMock = jest.fn();

  const repository = {
    getAllEstoque: getAllEstoqueMock,
    getEstoqueByPecaId: getEstoqueByPecaIdMock,
    createEstoque: createEstoqueMock,
    updateEstoque: updateEstoqueMock,
    deleteEstoque: deleteEstoqueMock,
  } as any;

  const movimentacaoRepository = {
    createMovimentacao: createMovimentacaoMock,
    listaMovimentacoes: listaMovimentacoesMock,
  } as any;

  const pecaRepository = {
    getPecaById: getPecaByIdMock,
  } as any;

  const service = new EstoqueService(repository, movimentacaoRepository, pecaRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar movimentação de entrada quando peça existe e não havia estoque', async () => {
    const pecaId = new ObjectId();
    getPecaByIdMock.mockResolvedValue({ _id: pecaId });
    getEstoqueByPecaIdMock.mockResolvedValue(null);
    createEstoqueMock.mockResolvedValue(undefined);
    createMovimentacaoMock.mockResolvedValue(undefined);

    const movimentacao = await service.createMovimentacao({
      pecaId: pecaId as any,
      tipo: 'ENTRADA',
      quantidade: 10,
      data: new Date(),
      origem: 'compra',
    });

    expect(movimentacao.tipo).toBe('ENTRADA');
    expect(createEstoqueMock).toHaveBeenCalledWith(expect.any(Estoque));
    expect(createMovimentacaoMock).toHaveBeenCalledWith(expect.any(MovimentacaoEstoque));
  });

  test('deve criar movimentação de saída quando há estoque suficiente', async () => {
    const pecaId = new ObjectId();
    getPecaByIdMock.mockResolvedValue({ _id: pecaId });
    getEstoqueByPecaIdMock.mockResolvedValue(new Estoque(pecaId, 10));
    updateEstoqueMock.mockResolvedValue(undefined);
    createMovimentacaoMock.mockResolvedValue(undefined);

    const movimentacao = await service.createMovimentacao({
      pecaId: pecaId as any,
      tipo: 'SAIDA',
      quantidade: 4,
      data: new Date(),
      origem: 'ordem',
    });

    expect(movimentacao.tipo).toBe('SAIDA');
    expect(updateEstoqueMock).toHaveBeenCalledWith(pecaId, 6);
    expect(createMovimentacaoMock).toHaveBeenCalledWith(expect.any(MovimentacaoEstoque));
  });

  test('deve rejeitar saída quando não há estoque', async () => {
    const pecaId = new ObjectId();
    getPecaByIdMock.mockResolvedValue({ _id: pecaId });
    getEstoqueByPecaIdMock.mockResolvedValue(null);

    await expect(
      service.createMovimentacao({
        pecaId: pecaId as any,
        tipo: 'SAIDA',
        quantidade: 1,
        data: new Date(),
        origem: 'ordem',
      })
    ).rejects.toThrow('Não há estoque para a peça especificada');

    expect(createMovimentacaoMock).not.toHaveBeenCalled();
  });

  test('deve rejeitar saída com quantidade insuficiente', async () => {
    const pecaId = new ObjectId();
    getPecaByIdMock.mockResolvedValue({ _id: pecaId });
    getEstoqueByPecaIdMock.mockResolvedValue(new Estoque(pecaId, 2));

    await expect(
      service.createMovimentacao({
        pecaId: pecaId as any,
        tipo: 'SAIDA',
        quantidade: 5,
        data: new Date(),
        origem: 'ordem',
      })
    ).rejects.toThrow('Quantidade insuficiente em estoque para a saída');

    expect(createMovimentacaoMock).not.toHaveBeenCalled();
  });

  test('deve rejeitar movimentação quando peça não existe', async () => {
    const pecaId = new ObjectId();
    getPecaByIdMock.mockResolvedValue(null);

    await expect(
      service.createMovimentacao({
        pecaId: pecaId as any,
        tipo: 'ENTRADA',
        quantidade: 3,
        data: new Date(),
        origem: 'compra',
      })
    ).rejects.toThrow('Peça não encontrada para a movimentação de estoque');

    expect(createMovimentacaoMock).not.toHaveBeenCalled();
  });

  test('deve retornar false ao deletar estoque inexistente', async () => {
    const pecaId = new ObjectId();
    getEstoqueByPecaIdMock.mockResolvedValue(null);

    const deleted = await service.deleteEstoque(pecaId);

    expect(deleted).toBe(false);
    expect(deleteEstoqueMock).not.toHaveBeenCalled();
  });

  test('deve deletar estoque existente', async () => {
    const pecaId = new ObjectId();
    getEstoqueByPecaIdMock.mockResolvedValue(new Estoque(pecaId, 10));
    deleteEstoqueMock.mockResolvedValue(undefined);

    const deleted = await service.deleteEstoque(pecaId);

    expect(deleted).toBe(true);
    expect(deleteEstoqueMock).toHaveBeenCalledWith(pecaId);
  });
});
