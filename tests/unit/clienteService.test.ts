import { ClienteService } from '../../src/services/cliente-service';
import { Cliente } from '../../src/Entities/cliente';

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
      nome: 'Cliente Exemplo',
      email: 'cliente@teste.com',
      cpf: '111.444.777-35',
      telefone: '11999999999',
    };

    // Act
    const cliente = await service.criarCliente(payload);

    // Assert
    expect(repo.criarCliente).toHaveBeenCalledWith(expect.objectContaining({
      nome: payload.nome,
      email: payload.email,
      cpf: '11144477735',
      telefone: payload.telefone,
    }));
    expect(cliente.cpf).toBe('111.444.777-35');
  });

  test('Deve validar CPF dos clientes - CPF inválido rejeita criação', async () => {
    // Arrange
    const invalidPayload = {
      nome: 'Cliente Inválido',
      email: 'invalido@teste.com',
      cpf: '000.000.000-00',
      telefone: '11999999999',
    };

    // Act / Assert
    await expect(service.criarCliente(invalidPayload)).rejects.toThrow('CPF/CNPJ inválido');
    expect(repo.criarCliente).not.toHaveBeenCalled();
  });

  test('Deve validar CNPJ dos clientes - CNPJ válido aceita criação', async () => {
    // Arrange
    const payload = {
      nome: 'Cliente Empresa',
      email: 'empresa@teste.com',
      cpf: '54.550.752/0001-55',
      telefone: '1133333333',
    };

    // Act
    const cliente = await service.criarCliente(payload);

    // Assert
    expect(repo.criarCliente).toHaveBeenCalledWith(expect.objectContaining({
      nome: payload.nome,
      email: payload.email,
      cpf: '54550752000155',
      telefone: payload.telefone,
    }));
    expect(cliente.cpf).toBe('54.550.752/0001-55');
  });

  test('Deve tratar dados sensíveis com validações adequadas - CPF é formatado ao retornar cliente', async () => {
    // Arrange
    const existing = new Cliente('Nome', 'email@teste.com', '11144477735', '11999999999');
    repo.getClienteById.mockResolvedValue(existing);

    // Act
    const cliente = await service.getClienteById('any-id');

    // Assert
    expect(cliente).not.toBeNull();
    expect(cliente?.cpf).toBe('111.444.777-35');
  });

  test('Deve tratar dados sensíveis com validações adequadas - CPF é sanitizado ao atualizar cliente', async () => {
    // Arrange
    const existing = new Cliente('Nome', 'email@teste.com', '11144477735', '11999999999');
    repo.getClienteById.mockResolvedValue(existing);
    const updates = { cpf: '111.444.777-35' };

    // Act
    const updated = await service.atualizarCliente('any-id', updates);

    // Assert
    expect(repo.atualizarCliente).toHaveBeenCalledWith('any-id', expect.objectContaining({ cpf: '11144477735' }));
    expect(updated?.cpf).toBe('11144477735');
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
