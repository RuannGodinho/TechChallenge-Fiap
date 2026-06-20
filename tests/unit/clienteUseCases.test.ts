import { CriarClienteUseCase } from '../../src/application/usecases/cliente/criar-cliente.usecase';
import { BuscarClientePorIdUseCase } from '../../src/application/usecases/cliente/buscar-cliente-por-id.usecase';
import { AtualizarClienteUseCase } from '../../src/application/usecases/cliente/atualizar-cliente.usecase';
import { DeletarClienteUseCase } from '../../src/application/usecases/cliente/deletar-cliente.usecase';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Email } from '../../src/enterprise/value-objects/email.vo';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../src/application/ports/cliente.gateway.port';

describe('Cliente use cases', () => {
    let gateway: jest.Mocked<IClienteGateway>;
    let criarClienteUseCase: CriarClienteUseCase;
    let buscarClientePorIdUseCase: BuscarClientePorIdUseCase;
    let atualizarClienteUseCase: AtualizarClienteUseCase;
    let deletarClienteUseCase: DeletarClienteUseCase;

    beforeEach(() => {
        gateway = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            findByDocumento: jest.fn().mockResolvedValue(null),
            save: jest.fn(async (cliente: Cliente) => cliente),
            update: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(false),
        };

        criarClienteUseCase = new CriarClienteUseCase(gateway);
        buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(gateway);
        atualizarClienteUseCase = new AtualizarClienteUseCase(gateway);
        deletarClienteUseCase = new DeletarClienteUseCase(gateway);
    });

    test('Deve validar CPF dos clientes - CPF válido aceita criação', async () => {
        const payload = {
            nome: 'Cliente Exemplo',
            email: 'cliente@teste.com',
            cpf: '111.444.777-35',
            telefone: '11999999999',
        };

        gateway.save.mockImplementation(async (cliente) =>
            new Cliente(
                cliente.nome,
                cliente.email,
                cliente.documento,
                cliente.telefone,
                'generated-id'
            )
        );

        const cliente = await criarClienteUseCase.execute(payload);

        expect(gateway.save).toHaveBeenCalledWith(
            expect.objectContaining({
                nome: payload.nome,
                telefone: payload.telefone,
            })
        );
        expect(cliente.documento.value).toBe('11144477735');
        expect(cliente.documento.formatted).toBe('111.444.777-35');
    });

    test('Deve validar CPF dos clientes - CPF inválido rejeita criação', async () => {
        const invalidPayload = {
            nome: 'Cliente Inválido',
            email: 'invalido@teste.com',
            cpf: '000.000.000-00',
            telefone: '11999999999',
        };

        await expect(criarClienteUseCase.execute(invalidPayload)).rejects.toThrow(
            'Erro ao criar cliente:CPF/CNPJ inválido'
        );
        expect(gateway.save).not.toHaveBeenCalled();
    });

    test('Deve validar CNPJ dos clientes - CNPJ válido aceita criação', async () => {
        const payload = {
            nome: 'Cliente Empresa',
            email: 'empresa@teste.com',
            cpf: '54.550.752/0001-55',
            telefone: '1133333333',
        };

        gateway.save.mockImplementation(async (cliente) => cliente);

        const cliente = await criarClienteUseCase.execute(payload);

        expect(cliente.documento.value).toBe('54550752000155');
        expect(cliente.documento.formatted).toBe('54.550.752/0001-55');
    });

    test('Deve tratar dados sensíveis com validações adequadas - CPF é formatado ao retornar cliente', async () => {
        const existing = new Cliente(
            'Nome',
            Email.from('email@teste.com'),
            Documento.from('11144477735'),
            '11999999999',
            'any-id'
        );
        gateway.findById.mockResolvedValue(existing);

        const cliente = await buscarClientePorIdUseCase.execute('any-id');

        expect(cliente).not.toBeNull();
        expect(cliente?.documento.formatted).toBe('111.444.777-35');
    });

    test('Deve tratar dados sensíveis com validações adequadas - CPF é sanitizado ao atualizar cliente', async () => {
        const existing = new Cliente(
            'Nome',
            Email.from('email@teste.com'),
            Documento.from('11144477735'),
            '11999999999',
            'any-id'
        );
        gateway.findById.mockResolvedValue(existing);
        gateway.update.mockImplementation(async (_id, cliente) => cliente);

        const updated = await atualizarClienteUseCase.execute('any-id', {
            cpf: '111.444.777-35',
        });

        expect(gateway.update).toHaveBeenCalledWith(
            'any-id',
            expect.objectContaining({
                documento: expect.objectContaining({ value: '11144477735' }),
            })
        );
        expect(updated?.documento.value).toBe('11144477735');
    });

    test('Deve oferecer CRUD de clientes - não deletar cliente inexistente', async () => {
        gateway.findById.mockResolvedValue(null);

        const deleted = await deletarClienteUseCase.execute('missing-id');

        expect(deleted).toBe(false);
        expect(gateway.delete).not.toHaveBeenCalled();
    });

    test('Deve oferecer CRUD de clientes - deletar cliente existente', async () => {
        const existing = new Cliente(
            'Nome',
            Email.from('email@teste.com'),
            Documento.from('11144477735'),
            '11999999999',
            'existing-id'
        );
        gateway.findById.mockResolvedValue(existing);
        gateway.delete.mockResolvedValue(true);

        const deleted = await deletarClienteUseCase.execute('existing-id');

        expect(deleted).toBe(true);
        expect(gateway.delete).toHaveBeenCalledWith('existing-id');
    });
});
