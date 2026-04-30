import { PecaService } from '../../src/services/PecaService';
import { ObjectId } from 'mongodb';
import { Peca } from '../../src/Entities/Estoque/Peca';

describe('PecaService', () => {
  const getAllPecasMock = jest.fn();
  const getPecaByIdMock = jest.fn();
  const createPecaMock = jest.fn();
  const updatePecaMock = jest.fn();
  const deletePecaMock = jest.fn();

  const repository = {
    getAllPecas: getAllPecasMock,
    getPecaById: getPecaByIdMock,
    createPeca: createPecaMock,
    updatePeca: updatePecaMock,
    deletePeca: deletePecaMock,
  } as any;

  const service = new PecaService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar peça válida com sucesso', async () => {
    getPecaByIdMock.mockResolvedValue(null);
    createPecaMock.mockResolvedValue(undefined);

    const result = await service.createPeca({
      Nome: 'Disco de Freio',
      Descricao: 'Disco dianteiro',
      Tipo: 'PECA' as any,
      Preco: 199.9,
    });

    expect(result).toBeInstanceOf(Peca);
    expect(result.Nome).toBe('Disco de Freio');
    expect(createPecaMock).toHaveBeenCalledWith(result);
  });

  test('deve rejeitar criação de peça com tipo inválido', async () => {
    await expect(
      service.createPeca({
        Nome: 'Óleo',
        Descricao: 'Óleo para motor',
        Tipo: 'COMBUSTIVEL' as any,
        Preco: 79.9,
      })
    ).rejects.toThrow('Tipo inválido. Use PECA ou INSUMO');

    expect(createPecaMock).not.toHaveBeenCalled();
  });

  test('deve retornar null ao atualizar peça inexistente', async () => {
    const id = new ObjectId();
    getPecaByIdMock.mockResolvedValue(null);

    const result = await service.updatePeca(id, { Nome: 'Novo nome' });

    expect(result).toBeNull();
    expect(updatePecaMock).not.toHaveBeenCalled();
  });

  test('deve atualizar peça existente com dados válidos', async () => {
    const id = new ObjectId();
    const existing = new Peca('Parafuso', 'Parafuso M8', 4.5, 'PECA' as any);
    getPecaByIdMock.mockResolvedValue(existing);
    updatePecaMock.mockResolvedValue(undefined);

    const result = await service.updatePeca(id, { Preco: 5.5, Tipo: 'INSUMO' as any });

    expect(result).toMatchObject({ Nome: 'Parafuso', Descricao: 'Parafuso M8', Preco: 5.5, Tipo: 'INSUMO' });
    expect(updatePecaMock).toHaveBeenCalledWith(id, expect.objectContaining({ Preco: 5.5, Tipo: 'INSUMO' }));
  });

  test('deve rejeitar atualização com tipo inválido', async () => {
    const id = new ObjectId();
    const existing = new Peca('Parafuso', 'Parafuso M8', 4.5, 'PECA' as any);
    getPecaByIdMock.mockResolvedValue(existing);

    await expect(service.updatePeca(id, { Tipo: 'INVALIDO' as any })).rejects.toThrow(
      'Tipo inválido. Use PECA ou INSUMO'
    );

    expect(updatePecaMock).not.toHaveBeenCalled();
  });

  test('deve retornar false ao deletar peça inexistente', async () => {
    const id = new ObjectId();
    getPecaByIdMock.mockResolvedValue(null);

    const deleted = await service.deletePeca(id);

    expect(deleted).toBe(false);
    expect(deletePecaMock).not.toHaveBeenCalled();
  });

  test('deve deletar peça existente', async () => {
    const id = new ObjectId();
    const existing = new Peca('Bateria', 'Bateria 12V', 299.9, 'INSUMO' as any);
    getPecaByIdMock.mockResolvedValue(existing);
    deletePecaMock.mockResolvedValue(undefined);

    const deleted = await service.deletePeca(id);

    expect(deleted).toBe(true);
    expect(deletePecaMock).toHaveBeenCalledWith(id);
  });
});
