import { AutenticarUsuarioUseCase } from '../../src/application/usecases/auth/autenticar-usuario.usecase';
import { VerificarTokenUseCase } from '../../src/application/usecases/auth/verificar-token.usecase';
import { IClienteGateway } from '../../src/application/ports/cliente.gateway.port';
import { ITokenPort } from '../../src/application/ports/token.port';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { StatusCliente } from '../../src/enterprise/value-objects/status-cliente.vo';

const ATIVO_CPF = '81788455045';

function clienteAtivo() {
    return Cliente.create('Ruann Godinho', 'ruann@gmail.com', ATIVO_CPF, '15997653816');
}

describe('Auth use cases', () => {
    let clienteGateway: jest.Mocked<IClienteGateway>;
    let tokenPort: jest.Mocked<ITokenPort>;

    beforeEach(() => {
        clienteGateway = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByDocumento: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        tokenPort = {
            sign: jest.fn(),
            verify: jest.fn(),
        };
    });

    test('autenticar cliente retorna token quando CPF existe e status e ATIVO', async () => {
        const cliente = clienteAtivo();
        cliente.id = 'cli-1';
        clienteGateway.findByDocumento.mockResolvedValue(cliente);
        tokenPort.sign.mockReturnValue('jwt-token');

        const useCase = new AutenticarUsuarioUseCase(clienteGateway, tokenPort);
        const result = await useCase.execute({ cpf: ATIVO_CPF });

        expect(result.success).toBe(true);
        expect(result.token).toBe('jwt-token');
        expect(tokenPort.sign).toHaveBeenCalledWith({
            userId: 'cli-1',
            cpf: ATIVO_CPF,
            email: 'ruann@gmail.com',
        });
    });

    test('autenticar cliente rejeita CPF inexistente', async () => {
        clienteGateway.findByDocumento.mockResolvedValue(null);

        const useCase = new AutenticarUsuarioUseCase(clienteGateway, tokenPort);
        const result = await useCase.execute({ cpf: '81421981009' });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(401);
        expect(result.error).toBe('Cliente não encontrado');
        expect(tokenPort.sign).not.toHaveBeenCalled();
    });

    test('autenticar cliente rejeita cliente inativo', async () => {
        const cliente = Cliente.create(
            'João Pereira',
            'joao@gmail.com',
            '52263606068',
            '11995553322',
            'INATIVO'
        );
        clienteGateway.findByDocumento.mockResolvedValue(cliente);

        const useCase = new AutenticarUsuarioUseCase(clienteGateway, tokenPort);
        const result = await useCase.execute({ cpf: '52263606068' });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(403);
        expect(result.error).toBe('Cliente inativo');
        expect(cliente.status).toEqual(StatusCliente.inativo());
        expect(tokenPort.sign).not.toHaveBeenCalled();
    });

    test('autenticar cliente rejeita CPF invalido', async () => {
        const useCase = new AutenticarUsuarioUseCase(clienteGateway, tokenPort);
        const result = await useCase.execute({ cpf: '00000000000' });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBe('CPF inválido');
        expect(clienteGateway.findByDocumento).not.toHaveBeenCalled();
    });

    test('verificar token retorna payload decodificado', () => {
        tokenPort.verify.mockReturnValue({
            userId: 'cli-1',
            cpf: ATIVO_CPF,
            email: 'ruann@gmail.com',
        });

        const useCase = new VerificarTokenUseCase(tokenPort);
        const result = useCase.execute('jwt-token');

        expect(result.cpf).toBe(ATIVO_CPF);
        expect(tokenPort.verify).toHaveBeenCalledWith('jwt-token');
    });
});
