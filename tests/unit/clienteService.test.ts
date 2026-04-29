import { ClienteService } from '../../src/services/ClienteService';
import { Cliente } from '../../src/Entities/Cliente';

describe('ClienteService', () => {
  let repo: any;
  let service: ClienteService;

  beforeEach(() => {
    repo = {
      getAllClientes: jest.fn().mockResolvedValue([]),
      getClienteById: jest.fn().mockResolvedValue(null),
      criarCliente: jest.fn().mockResolvedValue(undefined),
      atualizarCliente: jest.fn().mockResolvedValue(undefined),
      deletarCliente: jest.fn().mockResolvedValue(undefined),
    };

    service = new ClienteService(repo);
  });

  test('Deve validar CPF dos clientes - CPF válido aceita criação', async () => {
    // Arrange
    const payload = {
      Nome: 'Cliente Exemplo',
      Email: 'cliente@teste.com',
      Cpf: '111.444.777-35',
      Telefone: '11999999999',
    };

    // Act
    const cliente = await service.criarCliente(payload);

    // Assert
    expect(repo.criarCliente).toHaveBeenCalledWith(expect.objectContaining({
      Nome: payload.Nome,
      Email: payload.Email,
      Cpf: '11144477735',
      Telefone: payload.Telefone,
    }));
    expect(cliente.Cpf).toBe('11144477735');
  });

  test('Deve validar CPF dos clientes - CPF inválido rejeita criação', async () => {
    // Arrange
    const invalidPayload = {
      Nome: 'Cliente Inválido',
      Email: 'invalido@teste.com',
      Cpf: '000.000.000-00',
      Telefone: '11999999999',
    };

    // Act / Assert
    await expect(service.criarCliente(invalidPayload)).rejects.toThrow('CPF inválido');
    expect(repo.criarCliente).not.toHaveBeenCalled();
  });

  test('Deve tratar dados sensíveis com validações adequadas - CPF é formatado ao retornar cliente', async () => {
    // Arrange
    const existing = new Cliente('Nome', 'email@teste.com', '11144477735', '11999999999');
    repo.getClienteById.mockResolvedValue(existing);

    // Act
    const cliente = await service.getClienteById('any-id');

    // Assert
    expect(cliente).not.toBeNull();
    expect(cliente?.Cpf).toBe('111.444.777-35');
  });

  test('Deve tratar dados sensíveis com validações adequadas - CPF é sanitizado ao atualizar cliente', async () => {
    // Arrange
    const existing = new Cliente('Nome', 'email@teste.com', '11144477735', '11999999999');
    repo.getClienteById.mockResolvedValue(existing);
    const updates = { Cpf: '111.444.777-35' };

    // Act
    const updated = await service.atualizarCliente('any-id', updates);

    // Assert
    expect(repo.atualizarCliente).toHaveBeenCalledWith('any-id', expect.objectContaining({ Cpf: '11144477735' }));
    expect(updated?.Cpf).toBe('11144477735');
  });

  test('Deve oferecer CRUD de clientes - não deletar cliente inexistente', async () => {
    // Arrange
    repo.getClienteById.mockResolvedValue(null);

    // Act
    const deleted = await service.deletarCliente('missing-id');

    // Assert
    expect(deleted).toBe(false);
    expect(repo.deletarCliente).not.toHaveBeenCalled();
  });

  test('Deve oferecer CRUD de clientes - deletar cliente existente', async () => {
    // Arrange
    const existing = new Cliente('Nome', 'email@teste.com', '12345678909', '11999999999');
    repo.getClienteById.mockResolvedValue(existing);

    // Act
    const deleted = await service.deletarCliente('existing-id');

    // Assert
    expect(deleted).toBe(true);
    expect(repo.deletarCliente).toHaveBeenCalledWith('existing-id');
  });
});
